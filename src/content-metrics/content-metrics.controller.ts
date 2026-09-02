import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentMetricsService } from './content-metrics.service';

@ApiTags('content metrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('public/clients/:clientId/guides/angular-senior/shares')
export class ContentMetricsController {
  constructor(private readonly contentMetricsService: ContentMetricsService) {}

  @Get()
  @Public()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get the Angular Senior guide share count' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Current share count' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getAngularSeniorGuideShareCount(@Param('clientId') clientId: string) {
    return this.contentMetricsService.getAngularSeniorGuideShareCount(clientId);
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Increment the Angular Senior guide share count' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Updated share count' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  incrementAngularSeniorGuideShareCount(@Param('clientId') clientId: string) {
    return this.contentMetricsService.incrementAngularSeniorGuideShareCount(
      clientId,
    );
  }
}
