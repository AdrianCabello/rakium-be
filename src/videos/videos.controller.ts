import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('videos')
@Controller('projects/:projectId/videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('public')
  @Public()
  @ApiOperation({ 
    summary: 'Obtener videos de un proyecto publicado (público)',
    description: 'Obtiene todos los videos de un proyecto solo si está publicado. Este endpoint es público y no requiere autenticación.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Videos obtenidos exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Proyecto no encontrado o no publicado' 
  })
  async findPublicVideos(@Param('projectId') projectId: string) {
    return this.videosService.findPublicVideos(projectId);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Agregar un video de YouTube al proyecto',
    description: 'Agrega un video de YouTube al proyecto. Se verifica el límite de 10 videos.'
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID del proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Video agregado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se pueden agregar más de 10 videos o URL no válida' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Proyecto no encontrado' 
  })
  create(
    @Param('projectId') projectId: string,
    @Body() createVideoDto: CreateVideoDto,
  ) {
    return this.videosService.create(projectId, createVideoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los videos del proyecto' })
  @ApiResponse({ status: 200, description: 'Videos obtenidos exitosamente' })
  findAll(@Param('projectId') projectId: string) {
    return this.videosService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un video específico del proyecto' })
  @ApiResponse({ status: 200, description: 'Video obtenido exitosamente' })
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.videosService.findOne(projectId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un video del proyecto' })
  @ApiResponse({ status: 200, description: 'Video actualizado exitosamente' })
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    return this.videosService.update(projectId, id, updateVideoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un video del proyecto' })
  @ApiResponse({ status: 200, description: 'Video eliminado exitosamente' })
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.videosService.remove(projectId, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar videos del proyecto' })
  @ApiResponse({ status: 200, description: 'Videos reordenados exitosamente' })
  reorder(
    @Param('projectId') projectId: string,
    @Body('videoIds') videoIds: string[],
  ) {
    return this.videosService.reorder(projectId, videoIds);
  }
} 