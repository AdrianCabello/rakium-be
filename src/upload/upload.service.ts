import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ImageOptimizerService } from './image-optimizer.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER, StorageProvider } from './storage/storage-provider.interface';

@Injectable()
export class UploadService {
  constructor(
    private imageOptimizer: ImageOptimizerService,
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storageProvider: StorageProvider,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string = 'images', optimize: boolean = true): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.storageProvider.assertConfigured();

    // Validar tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo es demasiado grande. Máximo 10MB');
    }

    let uploadBuffer = file.buffer;
    let uploadMimeType = file.mimetype;
    let fileExtension = file.originalname.split('.').pop();

    // Optimizar imagen si está habilitado y es necesario
    if (optimize && await this.imageOptimizer.needsOptimization(file.buffer)) {
      const optimized = await this.imageOptimizer.autoOptimize(file.buffer, 'gallery');
      uploadBuffer = optimized.buffer;
      uploadMimeType = optimized.mimeType;
      fileExtension = optimized.mimeType.split('/')[1];
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    return this.storageProvider.uploadObject({
      key: fileName,
      body: uploadBuffer,
      contentType: uploadMimeType,
      acl: 'public-read',
    });
  }

  async uploadWithVariants(
    file: Express.Multer.File, 
    folder: string = 'images',
    variants: { name: string; width?: number; height?: number; quality?: number; format?: 'jpeg' | 'png' | 'webp' }[]
  ): Promise<{ [key: string]: string }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
    }

    // Crear variantes de la imagen
    const imageVariants = await this.imageOptimizer.createImageVariants(file.buffer, variants);
    const urls: { [key: string]: string } = {};

    // Subir cada variante
    for (const [variantName, variant] of Object.entries(imageVariants)) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = variant.mimeType.split('/')[1];
      const fileName = `${folder}/${variantName}/${timestamp}-${randomString}.${fileExtension}`;

      try {
        urls[variantName] = await this.storageProvider.uploadObject({
          key: fileName,
          body: variant.buffer,
          contentType: variant.mimeType,
          acl: 'public-read',
        });
      } catch (error) {
        throw new BadRequestException(`Error al subir la variante ${variantName}: ${error.message}`);
      }
    }

    return urls;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    await this.storageProvider.deleteObjectByUrl(fileUrl);
  }

  async generatePresignedUrl(fileName: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    return this.storageProvider.createPresignedUploadUrl({
      key: fileName,
      contentType,
      expiresIn,
    });
  }

  async uploadImage(file: Express.Multer.File, projectId: string, order?: number) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `projects/${projectId}/${fileName}`;

    const uploadResult = await this.uploadFile(file, filePath);

    const galleryItem = await this.prisma.gallery.create({
      data: {
        projectId,
        url: uploadResult,
        order: order || 0,
      },
    });

    return galleryItem;
  }
}
