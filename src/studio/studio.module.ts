import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professionals/professionals.controller';
import { ProfessionalsService } from './professionals/professionals.service';
import { PromosController } from './promos/promos.controller';
import { PromosService } from './promos/promos.service';
import { PublicSitesController } from './public-sites/public-sites.controller';
import { PublicSitesService } from './public-sites/public-sites.service';
import { ServiceCategoriesController } from './service-categories/service-categories.controller';
import { ServiceCategoriesService } from './service-categories/service-categories.service';
import { StudioServicesController } from './services/studio-services.controller';
import { StudioServicesService } from './services/studio-services.service';
import { SiteSettingsController } from './site-settings/site-settings.controller';
import { SiteSettingsService } from './site-settings/site-settings.service';

/** Sitios de estética administrables (Celina G Studio y futuros clientes similares). */
@Module({
  controllers: [
    ProfessionalsController,
    StudioServicesController,
    ServiceCategoriesController,
    PromosController,
    SiteSettingsController,
    PublicSitesController,
  ],
  providers: [
    ProfessionalsService,
    StudioServicesService,
    ServiceCategoriesService,
    PromosService,
    SiteSettingsService,
    PublicSitesService,
  ],
})
export class StudioModule {}
