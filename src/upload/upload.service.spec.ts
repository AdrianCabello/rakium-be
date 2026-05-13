import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { StorageProvider } from './storage/storage-provider.interface';

describe('UploadService storage provider integration', () => {
  const imageOptimizer = {
    needsOptimization: jest.fn(),
    autoOptimize: jest.fn(),
    createImageVariants: jest.fn(),
  };

  const prisma = {
    project: {
      findUnique: jest.fn(),
    },
    gallery: {
      create: jest.fn(),
    },
  };

  const storageProvider: jest.Mocked<StorageProvider> = {
    providerName: 'test-storage',
    assertConfigured: jest.fn(),
    uploadObject: jest.fn(),
    deleteObjectByUrl: jest.fn(),
    createPresignedUploadUrl: jest.fn(),
  };

  let service: UploadService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadService(imageOptimizer as any, prisma as any, storageProvider);
    imageOptimizer.needsOptimization.mockResolvedValue(false);
    storageProvider.uploadObject.mockResolvedValue('https://cdn.example.com/images/file.jpg');
  });

  it('uploads validated files through the configured storage provider', async () => {
    const file = createFile({ mimetype: 'image/jpeg', originalname: 'photo.jpg' });

    const url = await service.uploadFile(file, 'projects/demo', false);

    expect(url).toBe('https://cdn.example.com/images/file.jpg');
    expect(storageProvider.assertConfigured).toHaveBeenCalledTimes(1);
    expect(storageProvider.uploadObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringMatching(/^projects\/demo\/\d+-[a-z0-9]+\.jpg$/),
        body: file.buffer,
        contentType: 'image/jpeg',
        acl: 'public-read',
      }),
    );
  });

  it('rejects unsupported file types before calling the provider upload', async () => {
    const file = createFile({ mimetype: 'application/pdf', originalname: 'doc.pdf' });

    await expect(service.uploadFile(file)).rejects.toBeInstanceOf(BadRequestException);

    expect(storageProvider.uploadObject).not.toHaveBeenCalled();
  });

  function createFile(overrides: Partial<Express.Multer.File>): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: 'photo.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('image'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
      ...overrides,
    };
  }
});
