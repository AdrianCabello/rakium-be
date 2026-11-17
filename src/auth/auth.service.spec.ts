import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from './auth.service';

describe('AuthService · recuperar contraseña', () => {
  const prisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    passwordResetToken: { updateMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  };
  const mail = { sendPasswordResetEmail: jest.fn() };
  const config = {
    get: jest.fn((key: string) =>
      key === 'PASSWORD_RESET_URL_BASE' ? 'https://rakium.dev/reset-password' : undefined,
    ),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService({} as any, {} as any, prisma as any, config as any, mail as any);
  });

  it('answers the same when the email does not exist (no user enumeration)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await service.requestPasswordReset('nadie@test.com');

    expect(res.message).toContain('Si el email existe');
    expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('sends the link to the client site and with the client name', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'celina@test.com',
      client: { name: 'Celina G Studio', siteUrl: 'https://celinagstudio.com/' },
    });

    await service.requestPasswordReset('celina@test.com');

    const [to, url, options] = mail.sendPasswordResetEmail.mock.calls[0];
    expect(to).toBe('celina@test.com');
    expect(url).toMatch(/^https:\/\/celinagstudio\.com\/admin\/restablecer\?token=[\w-]+$/);
    expect(options).toEqual({ brandName: 'Celina G Studio' });
  });

  it('falls back to the Rakium reset page for clients without a site', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'a@test.com', client: null });

    await service.requestPasswordReset('a@test.com');

    expect(mail.sendPasswordResetEmail.mock.calls[0][1]).toMatch(/^https:\/\/rakium\.dev\/reset-password\?token=/);
  });

  it('stores only the hash of the token, never the token itself', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'c@test.com', client: null });

    await service.requestPasswordReset('c@test.com');

    const token = new URL(mail.sendPasswordResetEmail.mock.calls[0][1]).searchParams.get('token')!;
    const stored = prisma.passwordResetToken.create.mock.calls[0][0].data.tokenHash;
    expect(stored).toBe(createHash('sha256').update(token).digest('hex'));
    expect(stored).not.toBe(token);
  });

  it('rejects an expired or already used token', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 't1',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'user-1' },
    });

    await expect(service.resetPassword('cualquiera', 'nueva-clave')).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
