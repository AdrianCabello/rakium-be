import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { ImageOptimizerService } from './image-optimizer.service';
import { BackblazeStorageProvider } from './storage/backblaze-storage.provider';
import { GcsStorageProvider } from './storage/gcs-storage.provider';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    ImageOptimizerService,
    BackblazeStorageProvider,
    GcsStorageProvider,
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService, BackblazeStorageProvider, GcsStorageProvider, LocalStorageProvider],
      useFactory: (
        configService: ConfigService,
        backblazeStorageProvider: BackblazeStorageProvider,
        gcsStorageProvider: GcsStorageProvider,
        localStorageProvider: LocalStorageProvider,
      ) => {
        const provider =
          configService.get<string>('STORAGE_PROVIDER')?.trim().replace(/^['"]|['"]$/g, '').toLowerCase() ?? '';
        const hasGcsConfig = Boolean(configService.get<string>('GCS_BUCKET_NAME'));

        // Solo desarrollo: guarda en ./uploads y se sirve desde /uploads (ver main.ts).
        if (provider === 'local') {
          return localStorageProvider;
        }

        if (provider === 'gcs' || provider === 'google-cloud-storage' || (!provider && hasGcsConfig)) {
          return gcsStorageProvider;
        }

        return backblazeStorageProvider;
      },
    },
  ],
  exports: [UploadService, ImageOptimizerService],
})
export class UploadModule {}
