import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId?: string) {
    try {
      // Verificar que el cliente exista
      const client = await this.prisma.client.findUnique({
        where: { id: createProjectDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(`No se encontró ningún cliente con el ID: ${createProjectDto.clientId}`);
      }

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `No se puede crear el proyecto porque el cliente con ID ${createProjectDto.clientId} no existe en la base de datos.`
          );
        }
      }
      
      throw new BadRequestException(`Error al crear el proyecto: ${error.message}`);
    }
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