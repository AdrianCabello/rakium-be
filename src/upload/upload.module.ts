import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { ImageOptimizerService } from './image-optimizer.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService, ImageOptimizerService],
  exports: [UploadService, ImageOptimizerService],
})
export class UploadModule {} 