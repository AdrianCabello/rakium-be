import { Module } from '@nestjs/common';
import { ContentMetricsController } from './content-metrics.controller';
import { ContentMetricsService } from './content-metrics.service';

@Module({
  controllers: [ContentMetricsController],
  providers: [ContentMetricsService],
})
export class ContentMetricsModule {}
