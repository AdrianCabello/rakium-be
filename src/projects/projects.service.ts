import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId?: string) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        createdBy: userId,
      },
      include: {
        client: true,
        creator: true,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        client: true,
        creator: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        creator: true,
      },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.project.findMany({
      where: { clientId },
      include: {
        client: true,
        creator: true,
      },
    });
  }

  async update(id: string, updateProjectDto: Partial<CreateProjectDto>) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        client: true,
        creator: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
} 