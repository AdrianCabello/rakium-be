import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientId, StudioAdmin } from '../common/studio-admin.decorator';
import { ReorderDto, VisibilityDto } from '../common/studio.dto';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { StudioServicesService } from './studio-services.service';

@ApiTags('studio · services')
@StudioAdmin()
@Controller('services')
export class StudioServicesController {
  constructor(private readonly servicesService: StudioServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar servicios del cliente' })
  list(@ClientId() clientId: string) {
    return this.servicesService.list(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear servicio' })
  create(@ClientId() clientId: string, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(clientId, dto);
  }

  @Patch('reorder')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reordenar servicios' })
  reorder(@ClientId() clientId: string, @Body() dto: ReorderDto) {
    return this.servicesService.reorder(clientId, dto.items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener servicio' })
  findOne(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(clientId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar servicio' })
  update(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(clientId, id, dto);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Mostrar u ocultar servicio' })
  setVisibility(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: VisibilityDto) {
    return this.servicesService.update(clientId, id, { visible: dto.visible });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar servicio' })
  remove(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(clientId, id);
  }
}
