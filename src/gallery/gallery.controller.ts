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
    summary: 'Get gallery images from a published project (public)',
    description: 'Gets all gallery images from a project only if it is published. This endpoint is public and does not require authentication.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gallery images retrieved successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Project not found or not published' 
  })
  async findPublicGallery(@Param('projectId') projectId: string) {
    return this.galleryService.findPublicGallery(projectId);
  }

  @Post('upload')
  @ApiOperation({ 
    summary: 'Upload image directly to gallery',
    description: 'Uploads an image directly to the project gallery. The 10 image limit is verified.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file for gallery',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP)',
        },
        title: {
          type: 'string',
          description: 'Image title (optional)',
          example: 'Vista frontal del proyecto',
        },
        description: {
          type: 'string',
          description: 'Image description (optional)',
          example: 'Vista frontal del proyecto terminado',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Image uploaded successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot add more than 10 images or invalid file' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Project not found' 
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
  create(@Param('projectId') projectId: string, @Body() createGalleryDto: CreateGalleryDto) {
    return this.galleryService.create(projectId, createGalleryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images from project gallery' })
  @ApiResponse({ status: 200, description: 'Return all images' })
  findAll(@Param('projectId') projectId: string) {
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
  update(@Param('projectId') projectId: string, @Param('id') id: string, @Body() updateGalleryDto: UpdateGalleryDto) {
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
  reorder(@Param('projectId') projectId: string, @Body() galleryIds: string[]) {
    return this.galleryService.reorder(projectId, galleryIds);
  }

  @Get('public/:projectId')
  @Public()
  @ApiOperation({ summary: 'Get public gallery of a project' })
  @ApiResponse({ status: 200, description: 'Project gallery' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getPublicGallery(@Param('projectId') projectId: string) {
    return this.galleryService.findAll(projectId);
  }
} 