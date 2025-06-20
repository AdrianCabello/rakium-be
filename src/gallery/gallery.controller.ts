import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/public.decorator';

@ApiTags('gallery')
@Controller('projects/:projectId/gallery')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('public')
  @Public()
  @ApiOperation({ 
    summary: 'Obtener imágenes de la galería de un proyecto publicado (público)',
    description: 'Obtiene todas las imágenes de la galería de un proyecto solo si está publicado. Este endpoint es público y no requiere autenticación.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Imágenes de la galería obtenidas exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Proyecto no encontrado o no publicado' 
  })
  async findPublicGallery(@Param('projectId') projectId: string) {
    return this.galleryService.findPublicGallery(projectId);
  }

  @Post('upload')
  @ApiOperation({ 
    summary: 'Subir imagen directamente a la galería',
    description: 'Sube una imagen directamente a la galería del proyecto. Se verifica el límite de 10 imágenes.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen para la galería',
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
    description: 'Imagen subida exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se pueden agregar más de 10 imágenes o archivo no válido' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Proyecto no encontrado' 
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('description') description?: string,
  ) {
    return this.galleryService.createWithFile(projectId, file, title, description);
  }

  @Post()
  @ApiOperation({ summary: 'Add an image to project gallery' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  create(
    @Param('projectId') projectId: string,
    @Body() createGalleryDto: CreateGalleryDto,
  ) {
    return this.galleryService.create(projectId, createGalleryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images from project gallery' })
  @ApiResponse({ status: 200, description: 'Return all images' })
  findAll(@Param('projectId') projectId: string) {
    console.log(`🎯 Controlador: GET /projects/${projectId}/gallery llamado`);
    return this.galleryService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific image from project gallery' })
  @ApiResponse({ status: 200, description: 'Return the image' })
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.galleryService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an image in project gallery' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    return this.galleryService.update(projectId, id, updateGalleryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an image from project gallery' })
  @ApiResponse({ status: 200, description: 'Image removed successfully' })
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.galleryService.remove(projectId, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder images in project gallery' })
  @ApiResponse({ status: 200, description: 'Images reordered successfully' })
  reorder(
    @Param('projectId') projectId: string,
    @Body('galleryIds') galleryIds: string[],
  ) {
    return this.galleryService.reorder(projectId, galleryIds);
  }
} 