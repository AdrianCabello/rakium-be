import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { ImageOptimizerService } from './image-optimizer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor(
    private configService: ConfigService,
    private imageOptimizer: ImageOptimizerService,
    private prisma: PrismaService
  ) {
    this.bucketName = this.configService.get<string>('BACKBLAZE_BUCKET_NAME');
    this.accessKeyId = this.configService.get<string>('BACKBLAZE_ACCESS_KEY_ID');
    this.secretAccessKey = this.configService.get<string>('BACKBLAZE_SECRET_ACCESS_KEY');
    
    if (!this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      return;
    }
    
    // Configurar cliente S3 para Backblaze B2
    this.s3Client = new S3Client({
      region: 'us-east-005',
      endpoint: 'https://s3.us-east-005.backblazeb2.com',
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'images', optimize: boolean = true): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Verificar que Backblaze esté configurado
    if (!this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      throw new BadRequestException('Backblaze B2 no está configurado. Verifica las variables de entorno BACKBLAZE_ACCESS_KEY_ID, BACKBLAZE_SECRET_ACCESS_KEY y BACKBLAZE_BUCKET_NAME');
    }

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

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: uploadBuffer,
        ContentType: uploadMimeType,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      // Retornar la URL pública del archivo
      return `https://${this.bucketName}.s3.us-east-005.backblazeb2.com/${fileName}`;
    } catch (error) {
      if (error.name === 'InvalidAccessKeyId') {
        throw new BadRequestException('Credenciales de Backblaze B2 inválidas. Verifica BACKBLAZE_ACCESS_KEY_ID y BACKBLAZE_SECRET_ACCESS_KEY');
      }
      
      if (error.name === 'NoSuchBucket') {
        throw new BadRequestException('Bucket de Backblaze B2 no encontrado. Verifica BACKBLAZE_BUCKET_NAME');
      }
      
      throw new BadRequestException(`Error al subir el archivo: ${error.message}`);
    }
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
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: variant.buffer,
          ContentType: variant.mimeType,
          ACL: 'public-read',
        });

        await this.s3Client.send(command);
        urls[variantName] = `https://${this.bucketName}.s3.us-east-005.backblazeb2.com/${fileName}`;
      } catch (error) {
        throw new BadRequestException(`Error al subir la variante ${variantName}: ${error.message}`);
      }
    }

    return urls;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.s3Client || !this.bucketName) {
      throw new BadRequestException('Backblaze B2 no está configurado');
    }

    try {
      // Extraer la clave del archivo de la URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // Obtener folder/filename

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar el archivo: ${error.message}`);
    }
  }

  async generatePresignedUrl(fileName: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new BadRequestException('Backblaze B2 no está configurado');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
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