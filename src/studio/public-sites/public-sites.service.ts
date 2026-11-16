import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EMPTY_SITE_SETTINGS, SITE_SETTINGS_SELECT } from '../site-settings/site-settings.service';

const byOrder = [{ order: 'asc' as const }, { createdAt: 'asc' as const }];

const INTERNAL_FIELDS = ['clientId', 'createdAt', 'updatedAt', 'userId'] as const;
type InternalField = (typeof INTERNAL_FIELDS)[number];

/** Quita los campos internos antes de exponer un registro en la web pública. */
function toPublic<T extends object>(row: T): Omit<T, InternalField> {
  const rest = { ...row } as Record<string, unknown>;
  for (const field of INTERNAL_FIELDS) delete rest[field];
  return rest as Omit<T, InternalField>;
}

@Injectable()
export class PublicSitesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Todo lo que necesita la landing en una sola consulta. Solo contenido visible. */
  async getBySlug(slug: string) {
    const client = await this.prisma.client.findUnique({
      where: { slug },
      select: {
        id: true,
        siteSettings: { select: SITE_SETTINGS_SELECT },
        serviceCategories: { orderBy: byOrder, select: { id: true, name: true, slug: true, order: true } },
        services: { where: { visible: true }, orderBy: byOrder },
        professionals: { where: { visible: true }, orderBy: byOrder },
        promos: {
          where: { visible: true, OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
          orderBy: byOrder,
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`No existe un sitio con slug "${slug}"`);
    }

    return {
      clientId: client.id,
      settings: client.siteSettings ?? EMPTY_SITE_SETTINGS,
      categories: client.serviceCategories,
      services: client.services.map(toPublic),
      professionals: client.professionals.map(toPublic),
      promos: client.promos.map(toPublic),
    };
  }
}
