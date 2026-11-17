import { Injectable } from '@nestjs/common';
import { Promo } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopedCrudService } from '../common/scoped-crud.service';
import { CreatePromoDto, UpdatePromoDto } from './promo.dto';

@Injectable()
export class PromosService extends ScopedCrudService<Promo, CreatePromoDto, UpdatePromoDto> {
  protected readonly entityName = 'Promo';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get delegate() {
    return this.prisma.promo;
  }
}
