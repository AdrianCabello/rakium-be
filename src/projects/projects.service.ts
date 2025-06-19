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

      // Preparar los datos del proyecto
      const projectData = {
        ...createProjectDto,
        createdBy: userId,
        // Si type es undefined o null, no lo incluimos en los datos
        ...(createProjectDto.type === undefined || createProjectDto.type === null ? {} : { type: createProjectDto.type }),
      };

      return this.prisma.project.create({
        data: projectData,
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
        gallery: true,
        beforeImage: true,
        afterImage: true
      }
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

  async findPublicByClient(clientId: string) {
    // Verificar que el cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`No se encontró ningún cliente con el ID: ${clientId}`);
    }

    return this.prisma.project.findMany({
      where: { 
        clientId,
        showOnHomepage: true,
        status: 'PUBLISHED'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        gallery: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Preparar los datos de actualización
    const updateData = {
      ...updateProjectDto,
      // Si type es undefined o null, no lo incluimos en los datos
      ...(updateProjectDto.type === undefined || updateProjectDto.type === null ? {} : { type: updateProjectDto.type }),
    };

    return this.prisma.project.update({
      where: { id },
      data: updateData,
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

  async findAllByClientId(clientId: string) {
    return this.prisma.project.findMany({
      where: { 
        clientId,
        status: 'PUBLISHED'
      },
      include: {
        client: true,
        gallery: true,
        beforeImage: true,
        afterImage: true
      }
    });
  }
} 