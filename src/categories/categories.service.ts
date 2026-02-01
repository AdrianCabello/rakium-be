import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { value: createCategoryDto.value },
    });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese valor');
    }
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        value: createCategoryDto.value.toUpperCase().replace(/\s+/g, '_'),
        orderNum: createCategoryDto.orderNum ?? 0,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ orderNum: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    const data: { name?: string; value?: string; orderNum?: number } = {};
    if (updateCategoryDto.name !== undefined) data.name = updateCategoryDto.name;
    if (updateCategoryDto.value !== undefined) {
      data.value = updateCategoryDto.value.toUpperCase().replace(/\s+/g, '_');
      const existing = await this.prisma.category.findFirst({
        where: { value: data.value, id: { not: id } },
      });
      if (existing) throw new ConflictException('Ya existe una categoría con ese valor');
    }
    if (updateCategoryDto.orderNum !== undefined) data.orderNum = updateCategoryDto.orderNum;
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
