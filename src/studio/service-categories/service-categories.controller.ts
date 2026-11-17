import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientId, StudioAdmin } from '../common/studio-admin.decorator';
import { ReorderDto } from '../common/studio.dto';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './service-category.dto';
import { ServiceCategoriesService } from './service-categories.service';

@ApiTags('studio · service categories')
@StudioAdmin()
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly categoriesService: ServiceCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías de servicios' })
  list(@ClientId() clientId: string) {
    return this.categoriesService.list(clientId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoría' })
  create(@ClientId() clientId: string, @Body() dto: CreateServiceCategoryDto) {
    return this.categoriesService.create(clientId, dto);
  }

  @Patch('reorder')
  @HttpCode(204)
  @ApiOperation({ summary: 'Reordenar categorías' })
  reorder(@ClientId() clientId: string, @Body() dto: ReorderDto) {
    return this.categoriesService.reorder(clientId, dto.items);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar categoría' })
  update(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceCategoryDto) {
    return this.categoriesService.update(clientId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar categoría (sus servicios quedan sin categoría)' })
  remove(@ClientId() clientId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(clientId, id);
  }
}
