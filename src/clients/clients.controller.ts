import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @ApiOperation({ summary: 'Get all clients with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated client list retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter results', example: 'empresa' })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.clientsService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: Partial<CreateClientDto>) {
    return this.clientsService.update(id, updateClientDto);
  }

  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
} 