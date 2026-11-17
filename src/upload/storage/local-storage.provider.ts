import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join, normalize } from 'path';
import { StorageProvider, UploadObjectInput } from './storage-provider.interface';

/** Carpeta donde se guardan los archivos y ruta pública desde la que se sirven (ver main.ts). */
export const LOCAL_UPLOADS_DIR = join(process.cwd(), 'uploads');
export const LOCAL_UPLOADS_ROUTE = '/uploads';

/**
 * Almacenamiento en disco SOLO para desarrollo (STORAGE_PROVIDER=local).
 * Permite probar la subida de fotos sin credenciales de GCS/Backblaze.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly providerName = 'local';

  constructor(private readonly configService: ConfigService) {}

  assertConfigured(): void {
    // No necesita credenciales.
  }

  async uploadObject(input: UploadObjectInput): Promise<string> {
    const path = this.pathFor(input.key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, input.body);
    return `${this.publicBaseUrl()}${LOCAL_UPLOADS_ROUTE}/${input.key}`;
  }

  async deleteObjectByUrl(fileUrl: string): Promise<void> {
    const marker = `${LOCAL_UPLOADS_ROUTE}/`;
    const index = fileUrl.indexOf(marker);
    if (index === -1) return;
    await unlink(this.pathFor(decodeURIComponent(fileUrl.slice(index + marker.length)))).catch(() => undefined);
  }

  async createPresignedUploadUrl(): Promise<string> {
    throw new Error('El almacenamiento local no soporta URLs prefirmadas');
  }

  /** Evita que una key con "../" escriba fuera de la carpeta de uploads. */
  private pathFor(key: string): string {
    const path = normalize(join(LOCAL_UPLOADS_DIR, key));
    if (!path.startsWith(LOCAL_UPLOADS_DIR)) {
      throw new Error('Ruta de archivo inválida');
    }
    return path;
  }

  private publicBaseUrl(): string {
    return (
      this.configService.get<string>('LOCAL_UPLOADS_BASE_URL') ?? `http://localhost:${process.env.PORT ?? 3000}`
    ).replace(/\/+$/, '');
  }
}
