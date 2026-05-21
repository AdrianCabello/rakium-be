import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { VideosController } from './videos.controller';

describe('VideosController auth metadata', () => {
  it('protects the controller with JwtAuthGuard by default', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, VideosController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('keeps published-video read routes public', () => {
    expect(isPublic('findPublicVideos')).toBe(true);
    expect(isPublic('findAll')).toBe(true);
    expect(isPublic('findOne')).toBe(true);
  });

  it('keeps video write routes behind the controller guard', () => {
    expect(isPublic('create')).toBeFalsy();
    expect(isPublic('update')).toBeFalsy();
    expect(isPublic('remove')).toBeFalsy();
    expect(isPublic('reorder')).toBeFalsy();
  });

  function isPublic(methodName: keyof VideosController) {
    return Reflect.getMetadata(IS_PUBLIC_KEY, VideosController.prototype[methodName]);
  }
});
