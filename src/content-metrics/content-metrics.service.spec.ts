import { NotFoundException } from '@nestjs/common';
import { ContentMetricsService } from './content-metrics.service';

describe('ContentMetricsService', () => {
  const prisma = {
    client: {
      findUnique: jest.fn(),
    },
    contentMetric: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  let service: ContentMetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContentMetricsService(prisma as any);
    prisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
  });

  it('returns zero when the guide has not been shared yet', async () => {
    prisma.contentMetric.findUnique.mockResolvedValue(null);

    await expect(
      service.getAngularSeniorGuideShareCount('client-1'),
    ).resolves.toEqual({ shareCount: 0 });
  });

  it('increments the counter atomically', async () => {
    prisma.contentMetric.upsert.mockResolvedValue({ shareCount: 8 });

    await expect(
      service.incrementAngularSeniorGuideShareCount('client-1'),
    ).resolves.toEqual({ shareCount: 8 });
    expect(prisma.contentMetric.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { shareCount: { increment: 1 } },
      }),
    );
  });

  it('rejects metrics for an unknown client', async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    await expect(
      service.incrementAngularSeniorGuideShareCount('missing-client'),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.contentMetric.upsert).not.toHaveBeenCalled();
  });
});
