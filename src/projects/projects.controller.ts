import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { ProjectsQueryDto } from './dto/projects-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ 
    summary: 'Create a new project',
    description: 'Creates a new project with all necessary information including client details, location and project characteristics.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Project created successfully',
    type: CreateProjectDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid data - Verify that all required fields are present and in correct format'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication token required'
  })
  @Post()
  @ApiBody({
    type: CreateProjectDto,
    description: 'Project data to create. Required fields are: name, category and clientId. The rest are optional.',
    examples: {
      proyectoMinimo: {
        summary: 'Minimum project example',
        value: {
          // Required fields
          name: 'Remodelación Estación Norte',
          category: 'ESTACIONES',
          clientId: '123e4567-e89b-12d3-a456-426614174000'
        }
      },
      proyectoCompleto: {
        summary: 'Complete example with optional fields',
        value: {
          // Required fields
          name: 'Remodelación Estación Norte',
          category: 'ESTACIONES',
          clientId: '123e4567-e89b-12d3-a456-426614174000',
          
          // Optional fields
          status: 'DRAFT',
          type: 'LANDING',
          description: 'Remodelación completa de estación de servicio en zona norte',
          longDescription: 'Proyecto de remodelación integral de estación de servicio incluyendo área de conveniencia y restaurante',
          imageBefore: 'https://ejemplo.com/antes.jpg',
          imageAfter: 'https://ejemplo.com/despues.jpg',
          latitude: 19.4326,
          longitude: -99.1332,
          address: {
            address: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
            lat: 19.4326,
            lng: -99.1332
          },
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

  @ApiOperation({ summary: 'Get all projects with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated project list retrieved successfully' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter projects by client ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter results', example: 'estación' })
  @Get()
  findAll(@Query() query: ProjectsQueryDto) {
    const paginationDto: PaginationDto = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      search: query.search,
      clientId: query.clientId,
    };
    if (query.clientId) {
      return this.projectsService.findByClient(query.clientId, paginationDto);
    }
    return this.projectsService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get featured projects with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated featured project list retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter results', example: 'estación' })
  @Get('featured')
  findFeatured(@Query() paginationDto: PaginationDto) {
    return this.projectsService.findFeatured(paginationDto);
  }

  /** Rutas con prefijo "client" DEBEN ir antes de @Get(':id') para que NestJS no capture "client" como id. */
  @Get('client/:clientId/public')
  @Public()
  @ApiOperation({ summary: 'Get published projects by client (public, no auth)' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Paginated published projects for client' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter results' })
  async findPublicByClientId(@Param('clientId') clientId: string, @Query() paginationDto: PaginationDto) {
    return this.projectsService.findPublicByClient(clientId, paginationDto);
  }

  @Get('client/:clientId')
  @Public()
  @ApiOperation({ summary: 'Get projects by client with pagination' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Paginated client project list' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter results', example: 'estación' })
  async findAllByClientId(@Param('clientId') clientId: string, @Query() paginationDto: PaginationDto) {
    return this.projectsService.findAllByClientId(clientId, paginationDto);
  }

  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/published')
  @Public()
  @ApiOperation({ 
    summary: 'Get a published project by ID (public)',
    description: 'Gets a specific project only if it is in PUBLISHED status. This endpoint is public and does not require authentication.'
  })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Published project found' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Project not found or not published' 
  })
  async findPublishedProject(@Param('id') id: string) {
    return this.projectsService.findPublishedProject(id);
  }

  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Patch('reorder')
  @ApiOperation({ 
    summary: 'Reorder projects',
    description: 'Update the order of multiple projects at once'
  })
  @ApiResponse({ status: 200, description: 'Projects reordered successfully' })
  @ApiBody({
    description: 'Array of project IDs with their new order positions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          order: { type: 'number', example: 1 }
        }
      }
    }
  })
  async reorderProjects(@Body() reorderData: { id: string; order: number }[]) {
    return this.projectsService.reorderProjects(reorderData);
  }

  @Patch(':id/order/:order')
  @ApiOperation({ 
    summary: 'Set project order with conflict resolution',
    description: 'Set the order of a specific project, automatically resolving conflicts by shifting other projects'
  })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'order', description: 'New order position' })
  @ApiResponse({ status: 200, description: 'Project order updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async setProjectOrder(
    @Param('id') id: string,
    @Param('order') order: string
  ) {
    return this.projectsService.setProjectOrder(id, parseInt(order));
  }
} 