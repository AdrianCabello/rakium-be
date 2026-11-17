import { ForbiddenException } from '@nestjs/common';
import { resolveClientId } from './studio-admin.decorator';

describe('resolveClientId', () => {
  it('uses the clientId from the JWT', () => {
    expect(resolveClientId({ role: 'CLIENT_ADMIN', clientId: 'client-1' })).toBe('client-1');
  });

  it('ignores the ?clientId override for non-admin users', () => {
    expect(resolveClientId({ role: 'CLIENT_ADMIN', clientId: 'client-1' }, 'kamak')).toBe('client-1');
  });

  it('lets an ADMIN operate on another client', () => {
    expect(resolveClientId({ role: 'ADMIN', clientId: null }, 'client-2')).toBe('client-2');
  });

  it('rejects users without a client', () => {
    expect(() => resolveClientId({ role: 'ADMIN', clientId: null })).toThrow(ForbiddenException);
  });
});
