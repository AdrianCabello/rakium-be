import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { ImageOptimizerService } from './image-optimizer.service';
import { BackblazeStorageProvider } from './storage/backblaze-storage.provider';
import { GcsStorageProvider } from './storage/gcs-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    ImageOptimizerService,
    BackblazeStorageProvider,
    GcsStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService, BackblazeStorageProvider, GcsStorageProvider],
      useFactory: (
        configService: ConfigService,
        backblazeStorageProvider: BackblazeStorageProvider,
        gcsStorageProvider: GcsStorageProvider,
      ) => {
        const provider = configService.get<string>('STORAGE_PROVIDER')?.toLowerCase() ?? 'backblaze';

        if (provider === 'gcs' || provider === 'google-cloud-storage') {
          return gcsStorageProvider;
        }

        return backblazeStorageProvider;
      },
    },
  ],
  exports: [UploadService, ImageOptimizerService],
})
export class UploadModule {}
