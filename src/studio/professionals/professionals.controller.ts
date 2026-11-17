import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientId, StudioAdmin } from '../common/studio-admin.decorator';
import { ReorderDto, VisibilityDto } from '../common/studio.dto';
import { CreateProfessionalDto, UpdateProfessionalDto } from './professional.dto';
import { ProfessionalsService } from './professionals.service';

@ApiTags('studio · professionals')
@StudioAdmin()
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar profesionales del cliente' })
  list(@ClientId() clientId: string) {
    return this.professionalsService.list(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear profesional' })
  create(@ClientId() clientId: string, @Body() dto: CreateProfessionalDto) {
    return this.professionalsService.create(clientId, dto);
  }

  // Antes de ':id' para que "reorder" no se tome como id.
  @Patch('reorder')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reordenar profesionales' })
  reorder(@ClientId() clientId: string, @Body() dto: ReorderDto) {
    return this.professionalsService.reorder(clientId, dto.items);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener profesional' })
  findOne(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.findOne(clientId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar profesional' })
  update(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProfessionalDto) {
    return this.professionalsService.update(clientId, id, dto);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Mostrar u ocultar profesional' })
  setVisibility(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: VisibilityDto) {
    return this.professionalsService.update(clientId, id, { visible: dto.visible });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar profesional' })
  remove(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.remove(clientId, id);
  }
}
