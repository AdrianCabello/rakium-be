import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientId, StudioAdmin } from '../common/studio-admin.decorator';
import { ReorderDto, VisibilityDto } from '../common/studio.dto';
import { CreatePromoDto, UpdatePromoDto } from './promo.dto';
import { PromosService } from './promos.service';

@ApiTags('studio · promos')
@StudioAdmin()
@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar promos del cliente' })
  list(@ClientId() clientId: string) {
    return this.promosService.list(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear promo' })
  create(@ClientId() clientId: string, @Body() dto: CreatePromoDto) {
    return this.promosService.create(clientId, dto);
  }

  @Patch('reorder')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reordenar promos' })
  reorder(@ClientId() clientId: string, @Body() dto: ReorderDto) {
    return this.promosService.reorder(clientId, dto.items);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar promo' })
  update(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePromoDto) {
    return this.promosService.update(clientId, id, dto);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Mostrar u ocultar promo' })
  setVisibility(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: VisibilityDto) {
    return this.promosService.update(clientId, id, { visible: dto.visible });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar promo' })
  remove(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.promosService.remove(clientId, id);
  }
}
