import { BadRequestException } from '@nestjs/common';
import { StudioServicesService } from './studio-services.service';

describe('StudioServicesService', () => {
  const prisma = {
    service: {
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    serviceCategory: { count: jest.fn() },
    professional: { count: jest.fn() },
  };

  let service: StudioServicesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StudioServicesService(prisma as any);
    prisma.service.aggregate.mockResolvedValue({ _max: { order: null } });
    prisma.serviceCategory.count.mockResolvedValue(1);
    prisma.professional.count.mockResolvedValue(1);
  });

  it('generates the slug from the name when it is not sent', async () => {
    await service.create('client-1', { name: 'Nanoplastia + tinte', price: 60000 });

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'nanoplastia-tinte', clientId: 'client-1', price: 60000 }),
    });
  });

  it('keeps an explicit slug', async () => {
    await service.create('client-1', { name: 'Nanoplastia', slug: 'nano' });

    expect(prisma.service.create).toHaveBeenCalledWith({ data: expect.objectContaining({ slug: 'nano' }) });
  });

  it('rejects a category from another client', async () => {
    prisma.serviceCategory.count.mockResolvedValue(0);

    await expect(service.create('client-1', { name: 'Nanoplastia', categoryId: 'cat-kamak' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.serviceCategory.count).toHaveBeenCalledWith({ where: { id: 'cat-kamak', clientId: 'client-1' } });
    expect(prisma.service.create).not.toHaveBeenCalled();
  });

  it('rejects a professional from another client on update', async () => {
    prisma.professional.count.mockResolvedValue(0);

    await expect(service.update('client-1', 'svc-1', { professionalId: 'pro-kamak' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.service.update).not.toHaveBeenCalled();
  });
});
