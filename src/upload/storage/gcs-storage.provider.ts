import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import {
  PresignedUploadUrlInput,
  StorageProvider,
  UploadObjectInput,
} from './storage-provider.interface';

@Injectable()
export class GcsStorageProvider implements StorageProvider {
  readonly providerName = 'gcs';

  private readonly storage?: Storage;
  private readonly bucketName?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME');

    if (!this.bucketName) {
      return;
    }

    this.storage = new Storage(this.getClientOptions());
  }

  assertConfigured(): void {
    if (!this.storage || !this.bucketName) {
      throw new BadRequestException(
        'Google Cloud Storage no está configurado. Verifica STORAGE_PROVIDER, GCS_BUCKET_NAME y las credenciales de Google Cloud',
      );
    }
  }

  async uploadObject(input: UploadObjectInput): Promise<string> {
    this.assertConfigured();

    try {
      const file = this.storage.bucket(this.bucketName).file(input.key);

      await file.save(input.body, {
        contentType: input.contentType,
        resumable: false,
        predefinedAcl: input.acl === 'public-read' ? 'publicRead' : 'private',
      });

      return `https://storage.googleapis.com/${this.bucketName}/${input.key}`;
    } catch (error) {
      this.handleStorageError(error, 'Error al subir el archivo a Google Cloud Storage');
    }
  }

  async deleteObjectByUrl(fileUrl: string): Promise<void> {
    this.assertConfigured();

    try {
      const key = this.getObjectKeyFromUrl(fileUrl);
      await this.storage.bucket(this.bucketName).file(key).delete({ ignoreNotFound: true });
    } catch (error) {
      this.handleStorageError(error, 'Error al eliminar el archivo de Google Cloud Storage');
    }
  }

  async createPresignedUploadUrl(input: PresignedUploadUrlInput): Promise<string> {
    this.assertConfigured();

    try {
      const [url] = await this.storage
        .bucket(this.bucketName)
        .file(input.key)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + (input.expiresIn ?? 3600) * 1000,
          contentType: input.contentType,
        });

      return url;
    } catch (error) {
      this.handleStorageError(error, 'Error al generar URL firmada de Google Cloud Storage');
    }
  }

  private getClientOptions() {
    const projectId = this.configService.get<string>('GCS_PROJECT_ID');
    const serviceAccountJson = this.configService.get<string>('GCS_SERVICE_ACCOUNT_JSON');
    const keyFilename = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);

      return {
        projectId: projectId ?? credentials.project_id,
        credentials,
      };
    }

    if (keyFilename) {
      return {
        projectId,
        keyFilename,
      };
    }

    return {
      projectId,
    };
  }

  private getObjectKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl);
    const storageHostPath = `/${this.bucketName}/`;

    if (url.hostname === 'storage.googleapis.com' && url.pathname.startsWith(storageHostPath)) {
      return decodeURIComponent(url.pathname.slice(storageHostPath.length));
    }

    return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  }

  private handleStorageError(error: unknown, defaultMessage: string): never {
    const storageError = error as { message?: string };
    throw new BadRequestException(`${defaultMessage}: ${storageError.message ?? 'error desconocido'}`);
  }
}
