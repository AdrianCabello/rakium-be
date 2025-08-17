import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';
import { getPaginationParams, createPaginatedResponse, buildSearchFilter } from '../utils/pagination.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId?: string) {
    // Verificar que el cliente exista
    const client = await this.prisma.client.findUnique({
      where: { id: createProjectDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(`No se encontró ningún cliente con el ID: ${createProjectDto.clientId}`);
    }

    // Preparar los datos del proyecto - solo incluir campos válidos del DTO
    const projectData: Prisma.ProjectCreateInput = {
      name: createProjectDto.name,
      type: createProjectDto.type,
      status: createProjectDto.status,
      category: createProjectDto.category,
      description: createProjectDto.description,
      longDescription: createProjectDto.longDescription,
      imageBefore: createProjectDto.imageBefore,
      imageAfter: createProjectDto.imageAfter,
      latitude: createProjectDto.latitude,
      longitude: createProjectDto.longitude,
      address: createProjectDto.address as unknown as Prisma.JsonValue,
      country: createProjectDto.country,
      state: createProjectDto.state,
      city: createProjectDto.city,
      area: createProjectDto.area,
      duration: createProjectDto.duration,
      date: createProjectDto.date,
      startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
      endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : undefined,
      url: createProjectDto.url,
      client: {
        connect: { id: createProjectDto.clientId }
      },
      challenge: createProjectDto.challenge,
      solution: createProjectDto.solution,
      contactName: createProjectDto.contactName,
      contactPhone: createProjectDto.contactPhone,
      contactEmail: createProjectDto.contactEmail,
      budget: createProjectDto.budget,
      invoiceStatus: createProjectDto.invoiceStatus,
      notes: createProjectDto.notes,
      order: createProjectDto.order,
      githubUrl: createProjectDto.githubUrl,
      demoUrl: createProjectDto.demoUrl,
      technologies: createProjectDto.technologies as unknown as Prisma.JsonValue,
      ...(userId && { creator: { connect: { id: userId } } }),
    };

    // Filtrar campos undefined/null
    const filteredData = Object.fromEntries(
      Object.entries(projectData).filter(([_, value]) => value !== undefined && value !== null)
    ) as Prisma.ProjectCreateInput;

    return this.prisma.project.create({
      data: filteredData,
      include: {
        client: true,
        creator: true,
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { skip, take, page, limit } = getPaginationParams(paginationDto);
    const searchFilter = buildSearchFilter(paginationDto.search);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: searchFilter,
        include: {
          client: true,
          gallery: true,
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      this.prisma.project.count({
        where: searchFilter,
      }),
    ]);

    return createPaginatedResponse(projects, total, page, limit);
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        gallery: {
          orderBy: {
            order: 'asc',
          },
        },
        videos: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findPublishedProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
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
            order: 'asc',
          },
        },
        videos: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${id}`);
    }

    if (project.status !== 'PUBLISHED') {
      throw new NotFoundException(`El proyecto con ID ${id} no está publicado`);
    }

    return project;
  }

  async findByClient(clientId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { skip, take, page, limit } = getPaginationParams(paginationDto);
    const searchFilter = buildSearchFilter(paginationDto.search);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          clientId,
          ...searchFilter,
        },
        include: {
          client: true,
          gallery: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      this.prisma.project.count({
        where: {
          clientId,
          ...searchFilter,
        },
      }),
    ]);

    return createPaginatedResponse(projects, total, page, limit);
  }

  async findFeatured(paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { skip, take, page, limit } = getPaginationParams(paginationDto);
    const searchFilter = buildSearchFilter(paginationDto.search);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { 
          status: 'PUBLISHED',
          ...searchFilter,
        },
        include: {
          client: true,
          gallery: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.project.count({
        where: { 
          status: 'PUBLISHED',
          ...searchFilter,
        },
      }),
    ]);

    return createPaginatedResponse(projects, total, page, limit);
  }

  async findAllByClientId(clientId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    // Verificar que el cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`No se encontró ningún cliente con el ID: ${clientId}`);
    }

    const { skip, take, page, limit } = getPaginationParams(paginationDto);
    const searchFilter = buildSearchFilter(paginationDto.search);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { 
          clientId,
          // Removido el filtro de status para devolver todos los proyectos
          ...searchFilter,
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
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take,
      }),
      this.prisma.project.count({
        where: { 
          clientId,
          // Removido el filtro de status para contar todos los proyectos
          ...searchFilter,
        },
      }),
    ]);

    return createPaginatedResponse(projects, total, page, limit);
  }

  async findPublicByClient(clientId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    // Verificar que el cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`No se encontró ningún cliente con el ID: ${clientId}`);
    }

    const { skip, take, page, limit } = getPaginationParams(paginationDto);
    const searchFilter = buildSearchFilter(paginationDto.search);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { 
          clientId,
          status: 'PUBLISHED',
          ...searchFilter,
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
        skip,
        take,
      }),
      this.prisma.project.count({
        where: { 
          clientId,
          status: 'PUBLISHED',
          ...searchFilter,
        },
      }),
    ]);

    return createPaginatedResponse(projects, total, page, limit);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Si se está actualizando el orden, manejar conflictos automáticamente
    if (updateProjectDto.order !== undefined) {
      return this.handleOrderUpdate(id, updateProjectDto);
    }

    // Preparar los datos de actualización (sin orden)
    const updateData: Prisma.ProjectUpdateInput = {
      name: updateProjectDto.name,
      type: updateProjectDto.type,
      status: updateProjectDto.status,
      category: updateProjectDto.category,
      description: updateProjectDto.description,
      longDescription: updateProjectDto.longDescription,
      imageBefore: updateProjectDto.imageBefore,
      imageAfter: updateProjectDto.imageAfter,
      latitude: updateProjectDto.latitude,
      longitude: updateProjectDto.longitude,
      address: updateProjectDto.address as unknown as Prisma.JsonValue,
      country: updateProjectDto.country,
      state: updateProjectDto.state,
      city: updateProjectDto.city,
      area: updateProjectDto.area,
      duration: updateProjectDto.duration,
      date: updateProjectDto.date,
      startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : undefined,
      endDate: updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : undefined,
      url: updateProjectDto.url,
      challenge: updateProjectDto.challenge,
      solution: updateProjectDto.solution,
      contactName: updateProjectDto.contactName,
      contactPhone: updateProjectDto.contactPhone,
      contactEmail: updateProjectDto.contactEmail,
      budget: updateProjectDto.budget,
      invoiceStatus: updateProjectDto.invoiceStatus,
      notes: updateProjectDto.notes,
      githubUrl: updateProjectDto.githubUrl,
      demoUrl: updateProjectDto.demoUrl,
      technologies: updateProjectDto.technologies as unknown as Prisma.JsonValue,
      ...(updateProjectDto.clientId && { client: { connect: { id: updateProjectDto.clientId } } }),
    };

    // Filtrar campos undefined (pero permitir null explícito)
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as Prisma.ProjectUpdateInput;

    return this.prisma.project.update({
      where: { id },
      data: filteredData,
      include: {
        client: true,
        creator: true,
      },
    });
  }

  private async handleOrderUpdate(id: string, updateProjectDto: UpdateProjectDto) {
    // Obtener el proyecto actual
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { clientId: true, order: true }
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${id}`);
    }

    const newOrder = updateProjectDto.order!;

    // Verificar si ya existe un proyecto con ese orden en el mismo cliente
    const existingProject = await this.prisma.project.findFirst({
      where: {
        clientId: project.clientId,
        order: newOrder,
        id: { not: id } // Excluir el proyecto actual
      }
    });

    // Preparar los datos de actualización (incluyendo orden)
    const updateData: Prisma.ProjectUpdateInput = {
      name: updateProjectDto.name,
      type: updateProjectDto.type,
      status: updateProjectDto.status,
      category: updateProjectDto.category,
      description: updateProjectDto.description,
      longDescription: updateProjectDto.longDescription,
      imageBefore: updateProjectDto.imageBefore,
      imageAfter: updateProjectDto.imageAfter,
      latitude: updateProjectDto.latitude,
      longitude: updateProjectDto.longitude,
      address: updateProjectDto.address as unknown as Prisma.JsonValue,
      country: updateProjectDto.country,
      state: updateProjectDto.state,
      city: updateProjectDto.city,
      area: updateProjectDto.area,
      duration: updateProjectDto.duration,
      date: updateProjectDto.date,
      startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : undefined,
      endDate: updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : undefined,
      url: updateProjectDto.url,
      challenge: updateProjectDto.challenge,
      solution: updateProjectDto.solution,
      contactName: updateProjectDto.contactName,
      contactPhone: updateProjectDto.contactPhone,
      contactEmail: updateProjectDto.contactEmail,
      budget: updateProjectDto.budget,
      invoiceStatus: updateProjectDto.invoiceStatus,
      notes: updateProjectDto.notes,
      githubUrl: updateProjectDto.githubUrl,
      demoUrl: updateProjectDto.demoUrl,
      technologies: updateProjectDto.technologies as unknown as Prisma.JsonValue,
      order: newOrder,
      ...(updateProjectDto.clientId && { client: { connect: { id: updateProjectDto.clientId } } }),
    };

    // Filtrar campos undefined
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as Prisma.ProjectUpdateInput;

    // Si existe conflicto, resolverlo automáticamente
    if (existingProject) {
      // Desplazar todos los proyectos hacia arriba para hacer espacio
      await this.prisma.project.updateMany({
        where: {
          clientId: project.clientId,
          order: { gte: newOrder }
        },
        data: {
          order: { increment: 1 }
        }
      });
    }

    // Actualizar el proyecto con todos los datos
    return this.prisma.project.update({
      where: { id },
      data: filteredData,
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

  async reorderProjects(reorderData: { id: string; order: number }[]) {
    // Actualizar múltiples proyectos en una transacción
    const updates = reorderData.map(({ id, order }) =>
      this.prisma.project.update({
        where: { id },
        data: { order },
      })
    );

    return this.prisma.$transaction(updates);
  }

  async setProjectOrder(projectId: string, newOrder: number) {
    // Obtener el proyecto actual
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, order: true }
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar si ya existe un proyecto con ese orden en el mismo cliente
    const existingProject = await this.prisma.project.findFirst({
      where: {
        clientId: project.clientId,
        order: newOrder,
        id: { not: projectId } // Excluir el proyecto actual
      }
    });

    if (existingProject) {
      // Si existe conflicto, desplazar todos los proyectos hacia arriba
      await this.prisma.project.updateMany({
        where: {
          clientId: project.clientId,
          order: { gte: newOrder }
        },
        data: {
          order: { increment: 1 }
        }
      });
    }

    // Actualizar el proyecto con el nuevo orden
    return this.prisma.project.update({
      where: { id: projectId },
      data: { order: newOrder },
      include: {
        client: true,
        creator: true,
      },
    });
  }
} 