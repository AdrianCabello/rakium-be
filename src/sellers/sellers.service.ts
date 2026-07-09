import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus, Prisma, SellerActivityType, SellerStatus } from '@prisma/client';
import { CreateSellerActivityDto } from '../dto/create-seller-activity.dto';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { SellerQueryDto } from '../dto/seller-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginatedResponse, getPaginationParams } from '../utils/pagination.util';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SellerQueryDto) {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where = this.buildWhere(query);

    const [sellers, total] = await Promise.all([
      this.prisma.seller.findMany({
        where,
        include: {
          _count: {
            select: {
              leads: true,
              activities: true,
            },
          },
          activities: {
            orderBy: { occurredAt: 'desc' },
            take: 5,
            include: {
              lead: {
                select: { id: true, name: true, city: true, category: true },
              },
            },
          },
        },
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.seller.count({ where }),
    ]);

    return createPaginatedResponse(sellers, total, page, limit);
  }

  async stats() {
    const [
      total,
      active,
      training,
      assignedLeads,
      contactedLeads,
      totalActivities,
      contacts,
      visits,
      meetings,
      bySeller,
      recentActivities,
    ] = await Promise.all([
      this.prisma.seller.count(),
      this.prisma.seller.count({ where: { status: SellerStatus.ACTIVE } }),
      this.prisma.seller.count({ where: { status: SellerStatus.TRAINING } }),
      this.prisma.lead.count({ where: { assignedSellerId: { not: null } } }),
      this.prisma.lead.count({ where: { status: { in: [LeadStatus.CONTACTED, LeadStatus.REPLIED, LeadStatus.MEETING, LeadStatus.WON] } } }),
      this.prisma.sellerActivity.count(),
      this.prisma.sellerActivity.count({
        where: {
          type: {
            in: [
              SellerActivityType.INSTAGRAM_SENT,
              SellerActivityType.LINKEDIN_SENT,
              SellerActivityType.WHATSAPP_SENT,
              SellerActivityType.EMAIL_SENT,
              SellerActivityType.CALLED,
            ],
          },
        },
      }),
      this.prisma.sellerActivity.count({ where: { type: SellerActivityType.VISITED } }),
      this.prisma.sellerActivity.count({ where: { type: SellerActivityType.MEETING } }),
      this.prisma.seller.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
          dailyTarget: true,
          weeklyVisitTarget: true,
          _count: {
            select: { leads: true, activities: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
      this.prisma.sellerActivity.findMany({
        orderBy: { occurredAt: 'desc' },
        take: 12,
        include: {
          seller: { select: { id: true, name: true } },
          lead: { select: { id: true, name: true, city: true } },
        },
      }),
    ]);

    return {
      total,
      active,
      training,
      assignedLeads,
      contactedLeads,
      totalActivities,
      contacts,
      visits,
      meetings,
      bySeller,
      recentActivities,
    };
  }

  async create(createSellerDto: CreateSellerDto) {
    return this.prisma.seller.create({
      data: this.toSellerData(createSellerDto) as Prisma.SellerUncheckedCreateInput,
      include: { _count: { select: { leads: true, activities: true } } },
    });
  }

  async findOne(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      include: {
        leads: {
          orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
          take: 50,
        },
        activities: {
          orderBy: { occurredAt: 'desc' },
          take: 50,
          include: {
            lead: { select: { id: true, name: true, city: true, category: true, googleMapsUrl: true } },
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException(`Vendedor con ID ${id} no encontrado`);
    }

    return seller;
  }

  async update(id: string, updateSellerDto: Partial<CreateSellerDto>) {
    await this.ensureExists(id);
    return this.prisma.seller.update({
      where: { id },
      data: this.toSellerData(updateSellerDto),
      include: { _count: { select: { leads: true, activities: true } } },
    });
  }

  async assignLeads(id: string, leadIds: string[]) {
    const seller = await this.ensureExists(id);
    const result = await this.prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        assignedSellerId: id,
        assignedTo: seller.name,
      },
    });

    await this.prisma.sellerActivity.create({
      data: {
        sellerId: id,
        type: SellerActivityType.NOTE,
        note: `Asignados ${result.count} leads para seguimiento.`,
        channel: 'admin',
      },
    });

    return { assigned: result.count };
  }

  async addActivity(id: string, createActivityDto: CreateSellerActivityDto) {
    const seller = await this.ensureExists(id);
    if (createActivityDto.leadId) {
      const lead = await this.prisma.lead.findUnique({ where: { id: createActivityDto.leadId } });
      if (!lead) {
        throw new NotFoundException(`Lead con ID ${createActivityDto.leadId} no encontrado`);
      }
    }

    const activity = await this.prisma.sellerActivity.create({
      data: {
        sellerId: id,
        leadId: createActivityDto.leadId,
        type: createActivityDto.type,
        channel: createActivityDto.channel,
        note: createActivityDto.note,
        outcome: createActivityDto.outcome,
        address: createActivityDto.address,
        latitude: createActivityDto.latitude,
        longitude: createActivityDto.longitude,
        occurredAt: createActivityDto.occurredAt ? new Date(createActivityDto.occurredAt) : undefined,
        nextFollowUpAt: createActivityDto.nextFollowUpAt ? new Date(createActivityDto.nextFollowUpAt) : undefined,
      },
      include: {
        seller: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true, city: true } },
      },
    });

    if (createActivityDto.leadId) {
      const update = this.leadUpdateForActivity(createActivityDto, seller.name, id);
      await this.prisma.lead.update({
        where: { id: createActivityDto.leadId },
        data: update,
      });
    }

    return activity;
  }

  private async ensureExists(id: string) {
    const seller = await this.prisma.seller.findUnique({ where: { id } });
    if (!seller) {
      throw new NotFoundException(`Vendedor con ID ${id} no encontrado`);
    }
    return seller;
  }

  private buildWhere(query: SellerQueryDto): Prisma.SellerWhereInput {
    const search = String(query.search ?? '').trim();
    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { instagram: { contains: search, mode: 'insensitive' } },
              { linkedin: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private toSellerData(seller: Partial<CreateSellerDto>): Prisma.SellerUncheckedUpdateInput {
    return {
      ...seller,
      profileChecklist: seller.profileChecklist as Prisma.InputJsonValue,
      salesPlaybook: seller.salesPlaybook as Prisma.InputJsonValue,
      status: seller.status ?? undefined,
    };
  }

  private leadUpdateForActivity(
    activity: CreateSellerActivityDto,
    sellerName: string,
    sellerId: string,
  ): Prisma.LeadUncheckedUpdateInput {
    const contactTypes: SellerActivityType[] = [
      SellerActivityType.INSTAGRAM_SENT,
      SellerActivityType.LINKEDIN_SENT,
      SellerActivityType.WHATSAPP_SENT,
      SellerActivityType.EMAIL_SENT,
      SellerActivityType.CALLED,
      SellerActivityType.VISITED,
    ];
    const update: Prisma.LeadUncheckedUpdateInput = {
      assignedSellerId: sellerId,
      assignedTo: sellerName,
    };

    if (contactTypes.includes(activity.type)) {
      update.lastContactedAt = activity.occurredAt ? new Date(activity.occurredAt) : new Date();
      update.status = activity.type === SellerActivityType.VISITED ? LeadStatus.MEETING : LeadStatus.CONTACTED;
    }
    if (activity.type === SellerActivityType.REPLIED) update.status = LeadStatus.REPLIED;
    if (activity.type === SellerActivityType.MEETING) update.status = LeadStatus.MEETING;
    if (activity.nextFollowUpAt) update.nextFollowUpAt = new Date(activity.nextFollowUpAt);

    return update;
  }
}
