import { NotFoundException } from '@nestjs/common';
import { PublicSitesService } from './public-sites.service';

describe('PublicSitesService', () => {
  const prisma = { client: { findUnique: jest.fn() } };
  const stamps = { clientId: 'client-1', createdAt: new Date(), updatedAt: new Date() };

  let service: PublicSitesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PublicSitesService(prisma as any);
  });

  it('returns 404 for an unknown slug', async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    await expect(service.getBySlug('no-existe')).rejects.toThrow(NotFoundException);
  });

  it('only queries visible content and current promos', async () => {
    prisma.client.findUnique.mockResolvedValue({
      id: 'client-1',
      siteSettings: null,
      serviceCategories: [],
      services: [],
      professionals: [],
      promos: [],
    });

    await service.getBySlug('celinagstudio');

    const { select } = prisma.client.findUnique.mock.calls[0][0];
    expect(select.services.where).toEqual({ visible: true });
    expect(select.professionals.where).toEqual({ visible: true });
    expect(select.promos.where).toEqual({
      visible: true,
      OR: [{ validUntil: null }, { validUntil: { gte: expect.any(Date) } }],
    });
  });

  it('shapes the response and hides internal fields', async () => {
    prisma.client.findUnique.mockResolvedValue({
      id: 'client-1',
      siteSettings: null,
      serviceCategories: [{ id: 'cat-1', name: 'Alisados', slug: 'alisados', order: 0 }],
      services: [{ id: 'svc-1', name: 'Nanoplastia', ...stamps }],
      professionals: [{ id: 'pro-1', fullName: 'Celina Gómez', userId: 'user-1', ...stamps }],
      promos: [],
    });

    const site = await service.getBySlug('celinagstudio');

    expect(site).toEqual({
      clientId: 'client-1',
      settings: { whatsapp: null, instagram: null, address: null, mapsUrl: null, schedule: [] },
      categories: [{ id: 'cat-1', name: 'Alisados', slug: 'alisados', order: 0 }],
      services: [{ id: 'svc-1', name: 'Nanoplastia' }],
      professionals: [{ id: 'pro-1', fullName: 'Celina Gómez' }],
      promos: [],
    });
  });
});
