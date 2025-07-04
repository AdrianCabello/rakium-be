import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination.util';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(projectId: string, createGalleryDto: CreateGalleryDto) {
    // Verificar que el proyecto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        gallery: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar el límite de 10 imágenes
    if (project.gallery.length >= 10) {
      throw new BadRequestException('No se pueden agregar más de 10 imágenes a la galería');
    }

    // Obtener el último orden
    const lastOrder = project.gallery.length > 0 
      ? Math.max(...project.gallery.map(img => img.order))
      : -1;

    return this.prisma.gallery.create({
      data: {
        ...createGalleryDto,
        projectId,
        order: lastOrder + 1,
      },
    });
  }

  async createWithFile(
    projectId: string, 
    file: Express.Multer.File, 
    title?: string, 
    description?: string
  ) {
    // Verificar que el proyecto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        gallery: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`No se encontró ningún proyecto con el ID: ${projectId}`);
    }

    // Verificar el límite de 10 imágenes
    if (project.gallery.length >= 10) {
      throw new BadRequestException('No se pueden agregar más de 10 imágenes a la galería');
    }

    // Subir archivo a Backblaze B2 con optimización automática
    const folder = `projects/${projectId}/gallery`;
    const url = await this.uploadService.uploadFile(file, folder, true); // optimize = true

    // Obtener el último orden
    const lastOrder = project.gallery.length > 0 
      ? Math.max(...project.gallery.map(img => img.order))
      : -1;

    // Crear registro en la base de datos
    return this.prisma.gallery.create({
      data: {
        url,
        title,
        description,
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
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const { skip, take, page, limit } = getPaginationParams(paginationDto);

    const [gallery, total] = await Promise.all([
      this.prisma.gallery.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        skip,
        take,
      }),
      this.prisma.gallery.count({
        where: { projectId },
      }),
    ]);

    return createPaginatedResponse(gallery, total, page, limit);
  }

  async findPublicGallery(projectId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
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

    const [gallery, total] = await Promise.all([
      this.prisma.gallery.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
        skip,
        take,
      }),
      this.prisma.gallery.count({
        where: { projectId },
      }),
    ]);

    return createPaginatedResponse(gallery, total, page, limit);
  }

  async findOne(projectId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const gallery = await this.prisma.gallery.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery item with ID ${id} not found in project ${projectId}`);
    }

    return gallery;
  }

  async update(projectId: string, id: string, updateGalleryDto: UpdateGalleryDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const gallery = await this.prisma.gallery.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery item with ID ${id} not found in project ${projectId}`);
    }

    return this.prisma.gallery.update({
      where: { id },
      data: updateGalleryDto,
    });
  }

  async remove(projectId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const gallery = await this.prisma.gallery.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery item with ID ${id} not found in project ${projectId}`);
    }

    // Eliminar archivo de Backblaze B2 si existe
    if (gallery.url) {
      try {
        await this.uploadService.deleteFile(gallery.url);
      } catch (error) {
        // Log error but don't fail the operation
        console.error('Error deleting file from Backblaze:', error);
      }
    }

    return this.prisma.gallery.delete({
      where: { id },
    });
  }

  async reorder(projectId: string, galleryIds: string[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Verificar que todas las imágenes pertenecen al proyecto
    const galleries = await this.prisma.gallery.findMany({
      where: {
        id: { in: galleryIds },
        projectId,
      },
    });

    if (galleries.length !== galleryIds.length) {
      throw new NotFoundException('Some gallery items not found in the project');
    }

    // Actualizar el orden de cada imagen
    const updates = galleryIds.map((id, index) => {
      return this.prisma.gallery.update({
        where: { id },
        data: { order: index },
      });
    });

    return this.prisma.$transaction(updates);
  }
} 