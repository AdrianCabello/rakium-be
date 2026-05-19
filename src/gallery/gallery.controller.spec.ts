import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { GalleryController } from './gallery.controller';

describe('GalleryController auth metadata', () => {
  it('protects the controller with JwtAuthGuard by default', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, GalleryController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('keeps only published-gallery read routes public', () => {
    expect(isPublic('findPublicGallery')).toBe(true);
    expect(isPublic('getPublicGallery')).toBe(true);
  });

  it('keeps gallery write and private read routes behind the controller guard', () => {
    expect(isPublic('uploadImage')).toBeFalsy();
    expect(isPublic('create')).toBeFalsy();
    expect(isPublic('findAll')).toBeFalsy();
    expect(isPublic('findOne')).toBeFalsy();
    expect(isPublic('update')).toBeFalsy();
    expect(isPublic('remove')).toBeFalsy();
    expect(isPublic('reorder')).toBeFalsy();
  });

  function isPublic(methodName: keyof GalleryController) {
    return Reflect.getMetadata(IS_PUBLIC_KEY, GalleryController.prototype[methodName]);
  }
});
