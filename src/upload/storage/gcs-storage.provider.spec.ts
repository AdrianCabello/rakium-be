import { Storage } from '@google-cloud/storage';
import { BadRequestException } from '@nestjs/common';
import { GcsStorageProvider } from './gcs-storage.provider';

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn(),
}));

describe('GcsStorageProvider', () => {
  const save = jest.fn();
  const deleteFile = jest.fn();
  const getSignedUrl = jest.fn();
  const file = jest.fn();
  const bucket = jest.fn();

  const configService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    file.mockReturnValue({
      save,
      delete: deleteFile,
      getSignedUrl,
    });
    bucket.mockReturnValue({ file });
    (Storage as unknown as jest.Mock).mockImplementation(() => ({ bucket }));

    configService.get.mockImplementation((key: string) => {
      const values = {
        GCS_PROJECT_ID: 'rakium-project',
        GCS_BUCKET_NAME: 'rakium-bucket',
      };

      return values[key];
    });
  });

  it('uploads objects to GCS and returns a public storage URL', async () => {
    const provider = new GcsStorageProvider(configService as any);

    const url = await provider.uploadObject({
      key: 'projects/demo/image.webp',
      body: Buffer.from('image'),
      contentType: 'image/webp',
      acl: 'public-read',
    });

    expect(bucket).toHaveBeenCalledWith('rakium-bucket');
    expect(file).toHaveBeenCalledWith('projects/demo/image.webp');
    expect(save).toHaveBeenCalledWith(Buffer.from('image'), {
      contentType: 'image/webp',
      resumable: false,
    });
    expect(url).toBe('https://storage.googleapis.com/rakium-bucket/projects/demo/image.webp');
  });

  it('fails fast when the bucket is missing', () => {
    configService.get.mockReturnValue(undefined);

    const provider = new GcsStorageProvider(configService as any);

    expect(() => provider.assertConfigured()).toThrow(BadRequestException);
  });
});
