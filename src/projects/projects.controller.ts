import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos obtenida exitosamente' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filtrar proyectos por ID de cliente' })
  @Get()
  findAll(@Query('clientId') clientId?: string) {
    if (clientId) {
      return this.projectsService.findByClient(clientId);
    }
    return this.projectsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener proyectos destacados' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos destacados obtenida exitosamente' })
  @Get('featured')
  findFeatured() {
    return this.projectsService.findFeatured();
  }

  @ApiOperation({ summary: 'Obtener un proyecto por ID' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Eliminar un proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
} 