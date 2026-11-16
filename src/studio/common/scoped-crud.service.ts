import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReorderItemDto } from './studio.dto';

/**
 * Delegate de Prisma de un modelo con `clientId` y `order`. Los delegates generados
 * no comparten un tipo común, así que los argumentos quedan sin tipar acá.
 */
type ScopedDelegate = {
  findMany(args: any): Prisma.PrismaPromise<any[]>;
  findFirst(args: any): Prisma.PrismaPromise<any>;
  aggregate(args: any): Prisma.PrismaPromise<any>;
  count(args: any): Prisma.PrismaPromise<number>;
  create(args: any): Prisma.PrismaPromise<any>;
  update(args: any): Prisma.PrismaPromise<any>;
  delete(args: any): Prisma.PrismaPromise<any>;
};

/**
 * CRUD base para recursos de un cliente (profesionales, servicios, promos...).
 * Toda consulta se filtra por clientId, que viene del JWT.
 */
export abstract class ScopedCrudService<TModel, TCreate extends object, TUpdate extends object> {
  protected abstract readonly entityName: string;

  constructor(protected readonly prisma: PrismaService) {}

  protected abstract get delegate(): ScopedDelegate;

  list(clientId: string): Promise<TModel[]> {
    return this.delegate.findMany({ where: { clientId }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  }

  async findOne(clientId: string, id: string): Promise<TModel> {
    const entity = await this.delegate.findFirst({ where: { id, clientId } });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} con ID ${id} no encontrado`);
    }
    return entity;
  }

  async create(clientId: string, dto: TCreate): Promise<TModel> {
    const { _max } = await this.delegate.aggregate({ where: { clientId }, _max: { order: true } });
    const order = (_max.order ?? -1) + 1;
    return this.delegate.create({ data: { ...dto, clientId, order } });
  }

  async update(clientId: string, id: string, dto: TUpdate): Promise<TModel> {
    await this.findOne(clientId, id);
    return this.delegate.update({ where: { id }, data: dto });
  }

  async remove(clientId: string, id: string): Promise<void> {
    await this.findOne(clientId, id);
    await this.delegate.delete({ where: { id } });
  }

  async reorder(clientId: string, items: ReorderItemDto[]): Promise<void> {
    const ids = items.map((item) => item.id);
    const owned = await this.delegate.count({ where: { id: { in: ids }, clientId } });
    if (owned !== new Set(ids).size) {
      throw new ForbiddenException(`Hay ${this.entityName.toLowerCase()}s que no pertenecen al cliente`);
    }
    await this.prisma.$transaction(
      items.map(({ id, order }) => this.delegate.update({ where: { id }, data: { order } })),
    );
  }
}
