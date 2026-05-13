import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  PresignedUploadUrlInput,
  StorageProvider,
  UploadObjectInput,
} from './storage-provider.interface';

@Injectable()
export class BackblazeStorageProvider implements StorageProvider {
  readonly providerName = 'backblaze';

  private readonly s3Client?: S3Client;
  private readonly bucketName?: string;
  private readonly accessKeyId?: string;
  private readonly secretAccessKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('BACKBLAZE_BUCKET_NAME');
    this.accessKeyId = this.configService.get<string>('BACKBLAZE_ACCESS_KEY_ID');
    this.secretAccessKey = this.configService.get<string>('BACKBLAZE_SECRET_ACCESS_KEY');

    if (!this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      return;
    }

    this.s3Client = new S3Client({
      region: 'us-east-005',
      endpoint: 'https://s3.us-east-005.backblazeb2.com',
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  assertConfigured(): void {
    if (!this.s3Client || !this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      throw new BadRequestException(
        'Backblaze B2 no está configurado. Verifica las variables de entorno BACKBLAZE_ACCESS_KEY_ID, BACKBLAZE_SECRET_ACCESS_KEY y BACKBLAZE_BUCKET_NAME',
      );
    }
  }

  async uploadObject(input: UploadObjectInput): Promise<string> {
    this.assertConfigured();

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        ACL: input.acl ?? 'public-read',
      });

      await this.s3Client.send(command);

      return `https://${this.bucketName}.s3.us-east-005.backblazeb2.com/${input.key}`;
    } catch (error) {
      this.handleStorageError(error, 'Error al subir el archivo');
    }
  }

  async deleteObjectByUrl(fileUrl: string): Promise<void> {
    this.assertConfigured();

    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.slice(-2).join('/');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.handleStorageError(error, 'Error al eliminar el archivo');
    }
  }

  async createPresignedUploadUrl(input: PresignedUploadUrlInput): Promise<string> {
    this.assertConfigured();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: input.key,
      ContentType: input.contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: input.expiresIn ?? 3600 });
  }

  private handleStorageError(error: unknown, defaultMessage: string): never {
    const storageError = error as { name?: string; message?: string };

    if (storageError.name === 'InvalidAccessKeyId') {
      throw new BadRequestException(
        'Credenciales de Backblaze B2 inválidas. Verifica BACKBLAZE_ACCESS_KEY_ID y BACKBLAZE_SECRET_ACCESS_KEY',
      );
    }

    if (storageError.name === 'NoSuchBucket') {
      throw new BadRequestException('Bucket de Backblaze B2 no encontrado. Verifica BACKBLAZE_BUCKET_NAME');
    }

    throw new BadRequestException(`${defaultMessage}: ${storageError.message ?? 'error desconocido'}`);
  }
}
