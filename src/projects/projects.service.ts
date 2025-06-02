import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

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
      orderBy: {
        createdAt: 'desc',
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findFeatured() {
    return this.prisma.project.findMany({
      where: { showOnHomepage: true },
      include: {
        client: true,
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
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