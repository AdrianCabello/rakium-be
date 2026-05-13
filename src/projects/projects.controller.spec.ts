import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { ProjectsController } from './projects.controller';

describe('ProjectsController auth metadata', () => {
  it('protects the controller with JwtAuthGuard by default', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, ProjectsController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('keeps only published project list endpoints public', () => {
    expect(isPublic('findFeatured')).toBe(true);
    expect(isPublic('findPublicByClientId')).toBe(true);
    expect(isPublic('findPublishedProject')).toBe(true);
  });

  it('keeps private project management endpoints behind the controller guard', () => {
    expect(isPublic('create')).toBeFalsy();
    expect(isPublic('findAll')).toBeFalsy();
    expect(isPublic('findAllByClientId')).toBeFalsy();
    expect(isPublic('findOne')).toBeFalsy();
    expect(isPublic('update')).toBeFalsy();
    expect(isPublic('remove')).toBeFalsy();
    expect(isPublic('reorderProjects')).toBeFalsy();
    expect(isPublic('setProjectOrder')).toBeFalsy();
  });

  function isPublic(methodName: keyof ProjectsController) {
    return Reflect.getMetadata(IS_PUBLIC_KEY, ProjectsController.prototype[methodName]);
  }
});
