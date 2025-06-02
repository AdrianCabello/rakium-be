import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('gallery')
@Controller('projects/:projectId/gallery')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

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