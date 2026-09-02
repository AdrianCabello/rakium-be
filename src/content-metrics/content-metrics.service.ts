import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ANGULAR_SENIOR_GUIDE_KEY = 'angular-senior';

export interface ShareCountResponse {
  shareCount: number;
}

@Injectable()
export class ContentMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAngularSeniorGuideShareCount(
    clientId: string,
  ): Promise<ShareCountResponse> {
    await this.ensureClientExists(clientId);
    const metric = await this.prisma.contentMetric.findUnique({
      where: {
        unique_content_metric_per_client: {
          clientId,
          contentKey: ANGULAR_SENIOR_GUIDE_KEY,
        },
      },
      select: { shareCount: true },
    });

    return { shareCount: metric?.shareCount ?? 0 };
  }

  async incrementAngularSeniorGuideShareCount(
    clientId: string,
  ): Promise<ShareCountResponse> {
    await this.ensureClientExists(clientId);
    return this.prisma.contentMetric.upsert({
      where: {
        unique_content_metric_per_client: {
          clientId,
          contentKey: ANGULAR_SENIOR_GUIDE_KEY,
        },
      },
      create: {
        clientId,
        contentKey: ANGULAR_SENIOR_GUIDE_KEY,
        shareCount: 1,
      },
      update: {
        shareCount: { increment: 1 },
      },
      select: { shareCount: true },
    });
  }

  private async ensureClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
    }
  }
}
