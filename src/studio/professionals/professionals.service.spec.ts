import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';

describe('ProfessionalsService (CRUD por cliente)', () => {
  const prisma = {
    professional: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: ProfessionalsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfessionalsService(prisma as any);
  });

  it('lists only the professionals of the client, ordered', async () => {
    prisma.professional.findMany.mockResolvedValue([]);

    await service.list('client-1');

    expect(prisma.professional.findMany).toHaveBeenCalledWith({
      where: { clientId: 'client-1' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('creates at the end of the list with the clientId from the token', async () => {
    prisma.professional.aggregate.mockResolvedValue({ _max: { order: 2 } });
    prisma.professional.create.mockResolvedValue({ id: 'pro-1' });

    await service.create('client-1', { fullName: 'Celina Gómez', role: 'Estilista' });

    expect(prisma.professional.create).toHaveBeenCalledWith({
      data: { fullName: 'Celina Gómez', role: 'Estilista', clientId: 'client-1', order: 3 },
    });
  });

  it('starts ordering at 0 for the first professional', async () => {
    prisma.professional.aggregate.mockResolvedValue({ _max: { order: null } });

    await service.create('client-1', { fullName: 'Socia', role: 'Manicura' });

    expect(prisma.professional.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ order: 0 }),
    });
  });

  it('does not update a professional from another client', async () => {
    prisma.professional.findFirst.mockResolvedValue(null);

    await expect(service.update('client-1', 'pro-kamak', { role: 'X' })).rejects.toThrow(NotFoundException);
    expect(prisma.professional.update).not.toHaveBeenCalled();
  });

  it('does not delete a professional from another client', async () => {
    prisma.professional.findFirst.mockResolvedValue(null);

    await expect(service.remove('client-1', 'pro-kamak')).rejects.toThrow(NotFoundException);
    expect(prisma.professional.delete).not.toHaveBeenCalled();
  });

  it('rejects a reorder that includes foreign ids', async () => {
    prisma.professional.count.mockResolvedValue(1);

    await expect(
      service.reorder('client-1', [
        { id: 'pro-1', order: 0 },
        { id: 'pro-kamak', order: 1 },
      ]),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reorders in a single transaction', async () => {
    prisma.professional.count.mockResolvedValue(2);
    prisma.professional.update.mockReturnValue('update-op');

    await service.reorder('client-1', [
      { id: 'pro-1', order: 1 },
      { id: 'pro-2', order: 0 },
    ]);

    expect(prisma.$transaction).toHaveBeenCalledWith(['update-op', 'update-op']);
    expect(prisma.professional.update).toHaveBeenCalledWith({ where: { id: 'pro-2' }, data: { order: 0 } });
  });
});
