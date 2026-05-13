import { UsersService } from './users.service';

describe('UsersService response selection', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma as any);
  });

  it('does not request passwordHash for public user detail responses', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'admin@rakium.com',
      role: 'ADMIN',
      clientId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: null,
      projects: [],
    });

    await service.findOne('user-id');

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          passwordHash: true,
        }),
      }),
    );
  });

  it('does not request passwordHash for public email lookups', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'admin@rakium.com',
      role: 'ADMIN',
      clientId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: null,
    });

    await service.findByEmail('admin@rakium.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          passwordHash: true,
        }),
      }),
    );
  });
});
