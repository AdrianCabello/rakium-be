import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ 
    summary: 'Crear un nuevo proyecto',
    description: 'Crea un nuevo proyecto con toda la información necesaria incluyendo detalles del cliente, ubicación y características del proyecto.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Proyecto creado exitosamente',
    type: CreateProjectDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos - Verificar que todos los campos requeridos estén presentes y con el formato correcto'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Se requiere token de autenticación'
  })
  @Post()
  @ApiBody({
    type: CreateProjectDto,
    description: 'Datos del proyecto a crear. Los campos obligatorios son: name, category, clientId y showOnHomepage. El resto son opcionales.',
    examples: {
      proyectoMinimo: {
        summary: 'Ejemplo mínimo de proyecto',
        value: {
          // Campos obligatorios
          name: 'Remodelación Estación Norte',
          category: 'ESTACIONES',
          clientId: '123e4567-e89b-12d3-a456-426614174000',
          showOnHomepage: true
        }
      },
      proyectoCompleto: {
        summary: 'Ejemplo completo con campos opcionales',
        value: {
          // Campos obligatorios
          name: 'Remodelación Estación Norte',
          category: 'ESTACIONES',
          clientId: '123e4567-e89b-12d3-a456-426614174000',
          showOnHomepage: true,
          
          // Campos opcionales
          status: 'DRAFT',
          type: 'LANDING',
          description: 'Remodelación completa de estación de servicio en zona norte',
          longDescription: 'Proyecto de remodelación integral de estación de servicio incluyendo área de conveniencia y restaurante',
          imageBefore: 'https://ejemplo.com/antes.jpg',
          imageAfter: 'https://ejemplo.com/despues.jpg',
          latitude: 19.4326,
          longitude: -99.1332,
          address: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
          country: 'México',
          state: 'Ciudad de México',
          city: 'Benito Juárez',
          area: '500m²',
          duration: '3 meses',
          date: '2024-03-15',
          challenge: 'Mantener operaciones durante la remodelación',
          solution: 'Trabajo por fases y horarios especiales'
        }
      }
    }
  })
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

  @Get('client/:clientId')
  @Public()
  @ApiOperation({ summary: 'Obtener proyectos de un cliente' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos del cliente' })
  async findAllByClientId(@Param('clientId') clientId: string) {
    return this.projectsService.findAllByClientId(clientId);
  }
} 