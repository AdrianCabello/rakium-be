import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthController } from './auth.controller';

describe('AuthController auth metadata', () => {
  it('protects the controller with JwtAuthGuard by default', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AuthController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('keeps login public and protects profile endpoints', () => {
    expect(isPublic('login')).toBe(true);
    expect(isPublic('getProfile')).toBeFalsy();
    expect(isPublic('testAuth')).toBeFalsy();
  });

  function isPublic(methodName: keyof AuthController) {
    return Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype[methodName]);
  }
});
