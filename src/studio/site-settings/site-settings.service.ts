import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './site-settings.dto';

export const SITE_SETTINGS_SELECT = {
  whatsapp: true,
  instagram: true,
  address: true,
  mapsUrl: true,
  heroBefore: true,
  heroAfter: true,
  schedule: true,
} satisfies Prisma.SiteSettingsSelect;

export const EMPTY_SITE_SETTINGS = {
  whatsapp: null,
  instagram: null,
  address: null,
  mapsUrl: null,
  heroBefore: null,
  heroAfter: null,
  schedule: [],
};

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(clientId: string) {
    const settings = await this.prisma.siteSettings.findUnique({
      where: { clientId },
      select: SITE_SETTINGS_SELECT,
    });
    return settings ?? EMPTY_SITE_SETTINGS;
  }

  update(clientId: string, dto: UpdateSiteSettingsDto) {
    const data = {
      ...dto,
      schedule: dto.schedule as unknown as Prisma.InputJsonValue,
    };
    return this.prisma.siteSettings.upsert({
      where: { clientId },
      create: { ...data, clientId },
      update: data,
      select: SITE_SETTINGS_SELECT,
    });
  }
}
