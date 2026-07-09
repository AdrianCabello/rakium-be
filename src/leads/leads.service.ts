import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadActivityType, LeadSource, LeadStatus, Prisma } from '@prisma/client';
import { CreateLeadActivityDto } from '../dto/create-lead-activity.dto';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { ConvertLeadDto } from '../dto/convert-lead.dto';
import { LeadQueryDto } from '../dto/lead-query.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginatedResponse, getPaginationParams } from '../utils/pagination.util';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: LeadQueryDto): Promise<PaginatedResponseDto<any>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where = this.buildWhere(query);

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return createPaginatedResponse(leads, total, page, limit);
  }

  async stats() {
    const [total, byCity, byCategory, byStatus, needsWebsite, mapLeads] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.groupBy({
        by: ['city'],
        _count: { _all: true },
        orderBy: { _count: { city: 'desc' } },
      }),
      this.prisma.lead.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
        take: 12,
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true },
        orderBy: { _count: { status: 'desc' } },
      }),
      this.prisma.lead.count({ where: { needsWebsite: true } }),
      this.prisma.lead.findMany({
        where: { latitude: { not: null }, longitude: { not: null } },
        select: {
          id: true,
          name: true,
          city: true,
          category: true,
          address: true,
          latitude: true,
          longitude: true,
          phone: true,
          email: true,
          website: true,
          instagram: true,
          googleMapsUrl: true,
          digitalPresenceScore: true,
          status: true,
          priority: true,
          needsWebsite: true,
        },
        take: 500,
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      }),
    ]);

    return {
      total,
      needsWebsite,
      byCity: byCity.map((row) => ({ city: row.city, total: row._count._all })),
      byCategory: byCategory
        .filter((row) => row.category)
        .map((row) => ({ category: row.category, total: row._count._all })),
      byStatus: byStatus.map((row) => ({ status: row.status, total: row._count._all })),
      mapLeads,
    };
  }

  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: this.toLeadData(createLeadDto) as Prisma.LeadUncheckedCreateInput,
      include: { activities: true },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    if (!lead) {
      throw new NotFoundException(`Lead con ID ${id} no encontrado`);
    }
    return lead;
  }

  async update(id: string, updateLeadDto: Partial<CreateLeadDto>) {
    await this.ensureExists(id);

    return this.prisma.lead.update({
      where: { id },
      data: this.toLeadData(updateLeadDto),
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async addActivity(id: string, createActivityDto: CreateLeadActivityDto) {
    await this.ensureExists(id);

    const activity = await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        type: createActivityDto.type,
        note: createActivityDto.note,
        channel: createActivityDto.channel,
        scheduledAt: createActivityDto.scheduledAt,
      },
    });

    const update: Prisma.LeadUpdateInput = {};
    const outboundTypes: LeadActivityType[] = [
      LeadActivityType.INSTAGRAM_SENT,
      LeadActivityType.WHATSAPP_SENT,
      LeadActivityType.EMAIL_SENT,
      LeadActivityType.CALLED,
    ];
    if (outboundTypes.includes(createActivityDto.type)) {
      update.lastContactedAt = new Date();
      update.status = LeadStatus.CONTACTED;
    }
    if (createActivityDto.type === LeadActivityType.REPLIED) {
      update.status = LeadStatus.REPLIED;
    }
    if (createActivityDto.type === LeadActivityType.FOLLOW_UP && createActivityDto.scheduledAt) {
      update.nextFollowUpAt = createActivityDto.scheduledAt;
    }

    if (Object.keys(update).length > 0) {
      await this.prisma.lead.update({ where: { id }, data: update });
    }

    return activity;
  }

  async bulkUpsert(leads: CreateLeadDto[]) {
    const summary = { created: 0, updated: 0, skipped: 0 };
    const results = [];

    for (const lead of leads) {
      if (!lead?.name || !lead?.city) {
        summary.skipped += 1;
        continue;
      }

      const existing = await this.findDuplicate(lead);
      if (existing) {
        const updated = await this.prisma.lead.update({
          where: { id: existing.id },
          data: this.toLeadData(lead),
        });
        summary.updated += 1;
        results.push(updated);
      } else {
        const created = await this.prisma.lead.create({
          data: this.toLeadData(lead) as Prisma.LeadUncheckedCreateInput,
        });
        summary.created += 1;
        results.push(created);
      }
    }

    return { ...summary, total: results.length, data: results };
  }

  async convertToClient(id: string, convertLeadDto: ConvertLeadDto) {
    const lead = await this.ensureExists(id);
    const email = convertLeadDto.email || lead.email || `lead-${lead.id}@rakium.local`;
    const name = convertLeadDto.name || lead.name;

    const client = await this.prisma.client.upsert({
      where: { email },
      update: { name },
      create: { name, email },
    });

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.WON,
        convertedClientId: client.id,
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        type: LeadActivityType.STATUS_CHANGE,
        note: `Convertido a cliente: ${client.name}`,
        channel: 'admin',
      },
    });

    return { client, lead: updatedLead };
  }

  private async ensureExists(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead con ID ${id} no encontrado`);
    }
    return lead;
  }

  private async findDuplicate(lead: CreateLeadDto) {
    if (lead.source && lead.sourceId) {
      const bySource = await this.prisma.lead.findUnique({
        where: { unique_lead_source: { source: lead.source, sourceId: lead.sourceId } },
      });
      if (bySource) return bySource;
    }

    return this.prisma.lead.findFirst({
      where: {
        name: { equals: lead.name, mode: 'insensitive' },
        city: { equals: lead.city, mode: 'insensitive' },
        ...(lead.address ? { address: { equals: lead.address, mode: 'insensitive' } } : {}),
      },
    });
  }

  private buildWhere(query: LeadQueryDto): Prisma.LeadWhereInput {
    const search = String(query.search ?? '').trim();
    const contactWhere = this.buildContactWhere(query.contact);
    return {
      ...(contactWhere ? { AND: [contactWhere] } : {}),
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: { equals: query.category, mode: 'insensitive' } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
              { instagram: { contains: search, mode: 'insensitive' } },
              { website: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private buildContactWhere(contact?: LeadQueryDto['contact']): Prisma.LeadWhereInput | null {
    const hasValue = (field: 'instagram' | 'email' | 'phone'): Prisma.LeadWhereInput => ({
      [field]: { not: null },
      NOT: { [field]: '' },
    });

    if (contact === 'instagram' || contact === 'email' || contact === 'phone') {
      return hasValue(contact);
    }

    if (contact === 'any') {
      return {
        OR: [hasValue('instagram'), hasValue('email'), hasValue('phone')],
      };
    }

    return null;
  }

  private toLeadData(lead: Partial<CreateLeadDto>): Prisma.LeadUncheckedUpdateInput {
    const data: Prisma.LeadUncheckedUpdateInput = {
      ...lead,
      tags: lead.tags as Prisma.InputJsonValue,
      checklist: lead.checklist as Prisma.InputJsonValue,
      source: lead.source ?? LeadSource.MANUAL,
      digitalPresenceScore: lead.digitalPresenceScore ?? this.scoreLead(lead),
      needsWebsite: lead.needsWebsite ?? !lead.website,
    };
    return data;
  }

  private scoreLead(lead: Partial<CreateLeadDto>): number {
    let score = 25;
    if (!lead.website) score += 35;
    if (lead.instagram) score += lead.instagramQuality === 'POOR' ? 25 : 10;
    if (!lead.instagram && !lead.facebook) score += 15;
    if (lead.phone) score += 5;
    if (lead.category) score += 5;
    return Math.min(score, 100);
  }
}
