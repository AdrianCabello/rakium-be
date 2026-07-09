import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstagramConversationStatus, InstagramMessageDirection, LeadActivityType, LeadStatus, Prisma } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { InstagramConversationQueryDto } from '../dto/instagram-conversation-query.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { createPaginatedResponse, getPaginationParams } from '../utils/pagination.util';

interface InstagramMessagingEvent {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: unknown;
  };
}

@Injectable()
export class InstagramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  getSetup() {
    const apiBaseUrl = this.config.get<string>('PUBLIC_API_URL')?.replace(/\/$/, '') || 'https://api.rakium.dev/api';
    return {
      webhookUrl: `${apiBaseUrl}/integrations/instagram/webhook`,
      hasVerifyToken: Boolean(this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN')),
      hasAppSecret: Boolean(this.config.get<string>('META_APP_SECRET')),
      requiredEnv: ['META_WEBHOOK_VERIFY_TOKEN', 'META_APP_SECRET', 'PUBLIC_API_URL'],
      subscriptions: ['messages', 'messaging_postbacks'],
    };
  }

  verifyChallenge(mode?: string, token?: string, challenge?: string) {
    const expectedToken = this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && expectedToken && token === expectedToken && challenge) {
      return challenge;
    }
    throw new UnauthorizedException('Instagram webhook verification failed');
  }

  verifySignature(signature: string | undefined, rawBody?: Buffer) {
    const appSecret = this.config.get<string>('META_APP_SECRET');
    if (!appSecret) {
      return true;
    }
    if (!signature || !rawBody) {
      throw new UnauthorizedException('Missing Instagram webhook signature');
    }
    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Invalid Instagram webhook signature');
    }
    return true;
  }

  async receiveWebhook(payload: any) {
    const events = this.extractMessagingEvents(payload);
    const summary = { received: events.length, stored: 0, skipped: 0 };

    for (const event of events) {
      const stored = await this.storeMessagingEvent(event);
      if (stored) {
        summary.stored += 1;
      } else {
        summary.skipped += 1;
      }
    }

    return summary;
  }

  async findAll(query: InstagramConversationQueryDto): Promise<PaginatedResponseDto<any>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where: Prisma.InstagramConversationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { senderId: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { lastMessageText: { contains: query.search, mode: 'insensitive' } },
        { lead: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.instagramConversation.findMany({
        where,
        include: {
          lead: true,
          messages: {
            orderBy: { receivedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.instagramConversation.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const conversation = await this.prisma.instagramConversation.findUnique({
      where: { id },
      include: {
        lead: true,
        messages: {
          orderBy: { receivedAt: 'asc' },
          take: 100,
        },
      },
    });
    if (!conversation) {
      throw new NotFoundException(`Conversacion de Instagram ${id} no encontrada`);
    }
    return conversation;
  }

  async linkLead(id: string, leadId: string) {
    await this.ensureConversation(id);
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} no encontrado`);
    }

    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.instagramConversation.update({
        where: { id },
        data: {
          leadId,
          status: InstagramConversationStatus.MATCHED,
        },
        include: {
          lead: true,
          messages: {
            orderBy: { receivedAt: 'asc' },
            take: 100,
          },
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.REPLIED },
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          type: LeadActivityType.REPLIED,
          channel: 'instagram',
          note: 'Respuesta detectada por Instagram webhook y vinculada manualmente.',
        },
      });

      return conversation;
    });
  }

  async archive(id: string) {
    await this.ensureConversation(id);
    return this.prisma.instagramConversation.update({
      where: { id },
      data: { status: InstagramConversationStatus.ARCHIVED },
      include: { lead: true },
    });
  }

  private extractMessagingEvents(payload: any): InstagramMessagingEvent[] {
    if (!payload?.entry || !Array.isArray(payload.entry)) {
      return [];
    }
    return payload.entry.flatMap((entry: any) => (Array.isArray(entry.messaging) ? entry.messaging : []));
  }

  private async storeMessagingEvent(event: InstagramMessagingEvent) {
    const senderId = event.sender?.id;
    const messageId = event.message?.mid;
    if (!senderId || !messageId || !event.message || event.message.is_echo) {
      return false;
    }

    const receivedAt = event.timestamp ? new Date(event.timestamp) : new Date();
    if (Number.isNaN(receivedAt.getTime())) {
      throw new BadRequestException('Invalid Instagram message timestamp');
    }

    const conversation = await this.prisma.instagramConversation.upsert({
      where: { senderId },
      create: {
        senderId,
        lastMessageText: event.message.text,
        lastMessageAt: receivedAt,
      },
      update: {
        lastMessageText: event.message.text,
        lastMessageAt: receivedAt,
      },
    });

    try {
      await this.prisma.instagramMessage.create({
        data: {
          conversationId: conversation.id,
          messageId,
          direction: InstagramMessageDirection.INBOUND,
          text: event.message.text,
          attachments: event.message.attachments as Prisma.InputJsonValue,
          raw: event as Prisma.InputJsonValue,
          receivedAt,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        return false;
      }
      throw error;
    }

    if (conversation.leadId) {
      await this.prisma.lead.update({
        where: { id: conversation.leadId },
        data: { status: LeadStatus.REPLIED },
      });
    }

    return true;
  }

  private async ensureConversation(id: string) {
    const conversation = await this.prisma.instagramConversation.findUnique({ where: { id } });
    if (!conversation) {
      throw new NotFoundException(`Conversacion de Instagram ${id} no encontrada`);
    }
    return conversation;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
