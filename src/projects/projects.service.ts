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
      address: createProjectDto.address,
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
        orderBy: {
          createdAt: 'desc',
        },
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
        orderBy: {
          createdAt: 'desc',
        },
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
    // Preparar los datos de actualización
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
      address: updateProjectDto.address,
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
      ...(updateProjectDto.clientId && { client: { connect: { id: updateProjectDto.clientId } } }),
    };

    // Filtrar campos undefined/null
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
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

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
} 