import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BackblazeStorageProvider } from './backblaze-storage.provider';

jest.mock('@aws-sdk/client-s3', () => {
  const send = jest.fn();
  return {
    DeleteObjectCommand: jest.fn((input) => ({ input })),
    PutObjectCommand: jest.fn((input) => ({ input })),
    S3Client: jest.fn(() => ({ send })),
  };
});

describe('BackblazeStorageProvider', () => {
  const configService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      const values = {
        BACKBLAZE_BUCKET_NAME: 'rakium-bucket',
        BACKBLAZE_ACCESS_KEY_ID: 'key-id',
        BACKBLAZE_SECRET_ACCESS_KEY: 'secret',
      };

      return values[key];
    });
  });

  it('uploads objects to Backblaze and returns the public URL', async () => {
    const provider = new BackblazeStorageProvider(configService as any);
    const send = (S3Client as unknown as jest.Mock).mock.results[0].value.send;

    await expect(
      provider.uploadObject({
        key: 'projects/demo/gallery/image.webp',
        body: Buffer.from('image'),
        contentType: 'image/webp',
      }),
    ).resolves.toBe('https://rakium-bucket.s3.us-east-005.backblazeb2.com/projects/demo/gallery/image.webp');

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'rakium-bucket',
        Key: 'projects/demo/gallery/image.webp',
      }),
    );
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('deletes nested object keys from virtual-hosted Backblaze URLs', async () => {
    const provider = new BackblazeStorageProvider(configService as any);

    await provider.deleteObjectByUrl(
      'https://rakium-bucket.s3.us-east-005.backblazeb2.com/projects/demo/gallery/image.webp',
    );

    expect(DeleteObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'rakium-bucket',
        Key: 'projects/demo/gallery/image.webp',
      }),
    );
  });

  it('deletes nested object keys from path-style Backblaze URLs', async () => {
    const provider = new BackblazeStorageProvider(configService as any);

    await provider.deleteObjectByUrl(
      'https://s3.us-east-005.backblazeb2.com/rakium-bucket/projects/demo/gallery/image.webp',
    );

    expect(DeleteObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'rakium-bucket',
        Key: 'projects/demo/gallery/image.webp',
      }),
    );
  });
});
