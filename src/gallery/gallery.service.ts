import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createGalleryDto: CreateGalleryDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.gallery.create({
      data: {
        ...createGalleryDto,
        projectId,
      },
    });
  }

  async findAll(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.gallery.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(projectId: string, id: string) {
    const gallery = await this.prisma.gallery.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found in project ${projectId}`);
    }

    return gallery;
  }

  async update(projectId: string, id: string, updateGalleryDto: UpdateGalleryDto) {
    const gallery = await this.prisma.gallery.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found in project ${projectId}`);
    }

    return this.prisma.gallery.update({
      where: { id },
      data: updateGalleryDto,
    });
  }

  async remove(projectId: string, id: string) {
    const gallery = await this.prisma.gallery.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found in project ${projectId}`);
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