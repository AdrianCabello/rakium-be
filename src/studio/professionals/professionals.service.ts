import { Injectable } from '@nestjs/common';
import { Professional } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ScopedCrudService } from '../common/scoped-crud.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './professional.dto';

@Injectable()
export class ProfessionalsService extends ScopedCrudService<Professional, CreateProfessionalDto, UpdateProfessionalDto> {
  protected readonly entityName = 'Profesional';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get delegate() {
    return this.prisma.professional;
  }
}
