import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { UploadController } from './upload.controller';

describe('UploadController auth metadata', () => {
  it('protects the controller with JwtAuthGuard by default', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, UploadController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('does not expose write endpoints as public', () => {
    expect(isPublic('testUpload')).toBeFalsy();
    expect(isPublic('uploadFile')).toBeFalsy();
    expect(isPublic('uploadImageWithVariants')).toBeFalsy();
    expect(isPublic('uploadToProjectGallery')).toBeFalsy();
    expect(isPublic('uploadImageWithVariants2')).toBeFalsy();
  });

  function isPublic(methodName: keyof UploadController) {
    return Reflect.getMetadata(IS_PUBLIC_KEY, UploadController.prototype[methodName]);
  }
});
