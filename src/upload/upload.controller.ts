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

  @Post('image')
  @ApiOperation({ 
    summary: 'Subir una imagen',
    description: 'Sube una imagen al almacenamiento de Backblaze B2. Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP) con un tamaño máximo de 10MB.'
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
        folder: {
          type: 'string',
          description: 'Carpeta donde guardar la imagen (opcional, por defecto: images)',
          example: 'projects/gallery',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL pública de la imagen subida',
          example: 'https://bucket-name.s3.us-east-005.backblazeb2.com/images/1234567890-abc123.jpg',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Archivo no válido o demasiado grande' 
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const url = await this.uploadService.uploadFile(file, folder || 'images');
    
    return {
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
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
} 