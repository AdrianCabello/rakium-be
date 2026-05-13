export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface UploadObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
  acl?: 'public-read' | 'private';
}

export interface PresignedUploadUrlInput {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export interface StorageProvider {
  readonly providerName: string;

  assertConfigured(): void;
  uploadObject(input: UploadObjectInput): Promise<string>;
  deleteObjectByUrl(fileUrl: string): Promise<void>;
  createPresignedUploadUrl(input: PresignedUploadUrlInput): Promise<string>;
}
