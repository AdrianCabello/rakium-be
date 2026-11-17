import { Injectable } from '@nestjs/common';
import { ServiceCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopedCrudService } from '../common/scoped-crud.service';
import { slugify } from '../common/slug';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './service-category.dto';

@Injectable()
export class ServiceCategoriesService extends ScopedCrudService<
  ServiceCategory,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto
> {
  protected readonly entityName = 'Categoría';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get delegate() {
    return this.prisma.serviceCategory;
  }

  create(clientId: string, dto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    return super.create(clientId, { ...dto, slug: dto.slug ?? slugify(dto.name) });
  }
}
