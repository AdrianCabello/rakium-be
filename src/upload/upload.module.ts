import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { ImageOptimizerService } from './image-optimizer.service';
import { BackblazeStorageProvider } from './storage/backblaze-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    ImageOptimizerService,
    BackblazeStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: BackblazeStorageProvider,
    },
  ],
  exports: [UploadService, ImageOptimizerService],
})
export class UploadModule {}
