import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';
import { PublicSitesService } from './public-sites.service';

@ApiTags('studio · public')
@Controller('public/sites')
export class PublicSitesController {
  constructor(private readonly publicSitesService: PublicSitesService) {}

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Contenido visible de un sitio: ajustes, categorías, servicios, profesionales y promos' })
  getBySlug(@Param('slug') slug: string) {
    return this.publicSitesService.getBySlug(slug);
  }
}
