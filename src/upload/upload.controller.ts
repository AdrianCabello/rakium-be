import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  UseGuards,
  Body,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('test')
  @Public()
  @ApiOperation({ 
    summary: 'Test de upload (público)',
    description: 'Endpoint temporal público para probar el upload de imágenes'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen a subir',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, GIF, WebP)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async testUpload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const url = await this.uploadService.uploadFile(file, 'test');
    
    return {
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('file')
  @ApiOperation({
    summary: 'Upload a file to Backblaze B2',
    description: 'Uploads a file to Backblaze B2 storage with optional optimization. Supports images (JPEG, PNG, GIF, WebP) with automatic optimization enabled by default.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (images: JPEG, PNG, GIF, WebP)',
        },
        folder: {
          type: 'string',
          description: 'Folder where to save the file (optional)',
          example: 'projects/gallery',
        },
        optimize: {
          type: 'boolean',
          description: 'Enable image optimization (optional, default: true)',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'string',
      example: 'https://bucket-name.s3.us-east-005.backblazeb2.com/folder/timestamp-randomstring.jpg',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type, file too large, or Backblaze B2 not configured',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('optimize') optimize?: boolean,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const optimizeValue = optimize !== undefined ? optimize : true;
    return this.uploadService.uploadFile(file, folder || 'images', optimizeValue);
  }

  @Post('image')
  @ApiOperation({
    summary: 'Upload and optimize an image',
    description: 'Uploads an image and automatically optimizes it for web use. Creates multiple variants (thumbnail, medium, large) for better performance.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload and optimize',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP)',
        },
        folder: {
          type: 'string',
          description: 'Folder where to save the image (optional)',
          example: 'projects/gallery',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded and optimized successfully',
    schema: {
      type: 'object',
      properties: {
        original: {
          type: 'string',
          description: 'URL of the original image',
        },
        thumbnail: {
          type: 'string',
          description: 'URL of the thumbnail version (300x200)',
        },
        medium: {
          type: 'string',
          description: 'URL of the medium version (800x600)',
        },
        large: {
          type: 'string',
          description: 'URL of the large version (1200x800)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageWithVariants(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const variants = [
      { name: 'thumbnail', width: 300, height: 200, quality: 80, format: 'jpeg' as const },
      { name: 'medium', width: 800, height: 600, quality: 85, format: 'jpeg' as const },
      { name: 'large', width: 1200, height: 800, quality: 90, format: 'jpeg' as const },
    ];

    return this.uploadService.uploadWithVariants(file, folder || 'images', variants);
  }

  @Post('project/:projectId/gallery')
  @ApiOperation({ 
    summary: 'Subir imagen a la galería de un proyecto',
    description: 'Sube una imagen directamente a la galería de un proyecto específico.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen para la galería del proyecto',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, GIF, WebP)',
        },
        title: {
          type: 'string',
          description: 'Título de la imagen (opcional)',
          example: 'Vista frontal del proyecto',
        },
        description: {
          type: 'string',
          description: 'Descripción de la imagen (opcional)',
          example: 'Vista frontal del proyecto terminado',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagen subida a la galería exitosamente' 
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadToProjectGallery(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('description') description?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const folder = `projects/${projectId}/gallery`;
    const url = await this.uploadService.uploadFile(file, folder);
    
    return {
      url,
      title,
      description,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      projectId,
    };
  }

  @Post('image/variants')
  @ApiOperation({ 
    summary: 'Upload image with multiple optimized variants',
    description: 'Uploads an image and automatically creates multiple optimized versions (thumbnail, medium, large).'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload with variants',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP)',
        },
        folder: {
          type: 'string',
          description: 'Folder where to save the variants (optional)',
          example: 'projects/gallery',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Image uploaded with variants successfully',
    schema: {
      type: 'object',
      properties: {
        original: {
          type: 'string',
          description: 'URL of the original image',
        },
        thumbnail: {
          type: 'string',
          description: 'URL of the thumbnail version (300x200)',
        },
        medium: {
          type: 'string',
          description: 'URL of the medium version (800x600)',
        },
        large: {
          type: 'string',
          description: 'URL of the large version (1200x800)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageWithVariants2(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const variants = [
      { name: 'thumbnail', width: 300, height: 200, quality: 80, format: 'jpeg' as const },
      { name: 'medium', width: 800, height: 600, quality: 85, format: 'jpeg' as const },
      { name: 'large', width: 1200, height: 800, quality: 90, format: 'jpeg' as const },
    ];

    return this.uploadService.uploadWithVariants(file, folder || 'images', variants);
  }
} 