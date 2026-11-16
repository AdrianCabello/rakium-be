import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientId, StudioAdmin } from '../common/studio-admin.decorator';
import { UpdateSiteSettingsDto } from './site-settings.dto';
import { SiteSettingsService } from './site-settings.service';

@ApiTags('studio · site settings')
@StudioAdmin()
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'WhatsApp, dirección y horarios del sitio' })
  get(@ClientId() clientId: string) {
    return this.siteSettingsService.get(clientId);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar WhatsApp, dirección y horarios' })
  update(@ClientId() clientId: string, @Body() dto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.update(clientId, dto);
  }
}
