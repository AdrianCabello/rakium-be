import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination.util';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createVideoDto: CreateVideoDto) {
    // Verificar que el proyecto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        videos: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar el límite de 10 videos
    if (project.videos.length >= 10) {
      throw new BadRequestException('No se pueden agregar más de 10 videos al proyecto');
    }

    // Validar URL de YouTube
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(.*)?$/;
    if (!youtubeUrlPattern.test(createVideoDto.youtubeUrl)) {
      throw new BadRequestException('La URL debe ser una URL válida de YouTube');
    }

    // Obtener el último orden
    const lastOrder = project.videos.length > 0 
      ? Math.max(...project.videos.map(video => video.order))
      : -1;

    return this.prisma.video.create({
      data: {
        ...createVideoDto,
        projectId,
        order: lastOrder + 1,
      },
    });
  }

  async findAll(projectId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar que el proyecto esté publicado para acceso público
    if (project.status !== 'PUBLISHED') {
      throw new NotFoundException(`El proyecto con ID ${projectId} no está publicado`);
    }

    const { skip, take, page, limit } = getPaginationParams(paginationDto);

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        skip,
        take,
      }),
      this.prisma.video.count({
        where: { projectId },
      }),
    ]);

    return createPaginatedResponse(videos, total, page, limit);
  }

  async findPublicVideos(projectId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    if (project.status !== 'PUBLISHED') {
      throw new NotFoundException(`El proyecto con ID ${projectId} no está publicado`);
    }

    const { skip, take, page, limit } = getPaginationParams(paginationDto);

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        skip,
        take,
      }),
      this.prisma.video.count({
        where: { projectId },
      }),
    ]);

    return createPaginatedResponse(videos, total, page, limit);
  }

  async findOne(projectId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar que el proyecto esté publicado para acceso público
    if (project.status !== 'PUBLISHED') {
      throw new NotFoundException(`El proyecto con ID ${projectId} no está publicado`);
    }

    const video = await this.prisma.video.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found in project ${projectId}`);
    }

    return video;
  }

  async update(projectId: string, id: string, updateVideoDto: UpdateVideoDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    const video = await this.prisma.video.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found in project ${projectId}`);
    }

    // Validar URL de YouTube si se está actualizando
    if (updateVideoDto.youtubeUrl) {
      const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(.*)?$/;
      if (!youtubeUrlPattern.test(updateVideoDto.youtubeUrl)) {
        throw new BadRequestException('La URL debe ser una URL válida de YouTube');
      }
    }

    return this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async remove(projectId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    const video = await this.prisma.video.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found in project ${projectId}`);
    }

    return this.prisma.video.delete({
      where: { id },
    });
  }

  async reorder(projectId: string, videoIds: string[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar que todos los videos pertenecen al proyecto
    const videos = await this.prisma.video.findMany({
      where: {
        id: { in: videoIds },
        projectId,
      },
    });

    if (videos.length !== videoIds.length) {
      throw new NotFoundException('Some videos not found in the project');
    }

    // Actualizar el orden de cada video
    const updates = videoIds.map((id, index) => {
      return this.prisma.video.update({
        where: { id },
        data: { order: index },
      });
    });

    return this.prisma.$transaction(updates);
  }
} 