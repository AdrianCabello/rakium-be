import { BadRequestException } from '@nestjs/common';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  const prisma = {
    client: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      count: jest.fn(),
    },
  };

  let service: ClientsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ClientsService(prisma as any);
  });

  it('blocks deleting a client that still has associated projects', async () => {
    prisma.client.findUnique.mockResolvedValue({
      id: 'client-1',
      name: 'Candela',
      email: 'candela@example.com',
      projects: [],
      users: [],
    });
    prisma.project.count.mockResolvedValue(3);

    await expect(service.remove('client-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.client.delete).not.toHaveBeenCalled();
  });

  it('deletes a client without associated projects', async () => {
    const deletedClient = {
      id: 'client-1',
      name: 'Candela',
      email: 'candela@example.com',
    };
    prisma.client.findUnique.mockResolvedValue({
      ...deletedClient,
      projects: [],
      users: [],
    });
    prisma.project.count.mockResolvedValue(0);
    prisma.client.delete.mockResolvedValue(deletedClient);

    await expect(service.remove('client-1')).resolves.toEqual(deletedClient);
    expect(prisma.client.delete).toHaveBeenCalledWith({
      where: { id: 'client-1' },
    });
  });
});
