import { BadRequestException, Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopedCrudService } from '../common/scoped-crud.service';
import { slugify } from '../common/slug';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';

/** Servicios del studio (tratamientos). "Studio" evita confundirlo con los services de Nest. */
@Injectable()
export class StudioServicesService extends ScopedCrudService<Service, CreateServiceDto, UpdateServiceDto> {
  protected readonly entityName = 'Servicio';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get delegate() {
    return this.prisma.service;
  }

  async create(clientId: string, dto: CreateServiceDto): Promise<Service> {
    await this.ensureRelationsBelongToClient(clientId, dto);
    return super.create(clientId, { ...dto, slug: dto.slug ?? slugify(dto.name) });
  }

  async update(clientId: string, id: string, dto: UpdateServiceDto): Promise<Service> {
    await this.ensureRelationsBelongToClient(clientId, dto);
    return super.update(clientId, id, dto);
  }

  /** Categoría y profesional tienen que ser del mismo cliente. */
  private async ensureRelationsBelongToClient(clientId: string, dto: UpdateServiceDto) {
    const [category, professional] = await Promise.all([
      dto.categoryId
        ? this.prisma.serviceCategory.count({ where: { id: dto.categoryId, clientId } })
        : Promise.resolve(1),
      dto.professionalId
        ? this.prisma.professional.count({ where: { id: dto.professionalId, clientId } })
        : Promise.resolve(1),
    ]);
    if (!category) throw new BadRequestException('La categoría no pertenece al cliente');
    if (!professional) throw new BadRequestException('La profesional no pertenece al cliente');
  }
}
