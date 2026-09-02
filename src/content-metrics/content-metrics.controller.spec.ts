import { GUARDS_METADATA } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentMetricsController } from './content-metrics.controller';

describe('ContentMetricsController auth metadata', () => {
  it('uses the standard JWT guard while exposing only its declared public routes', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      ContentMetricsController,
    );

    expect(guards).toContain(JwtAuthGuard);
    expect(isPublic('getAngularSeniorGuideShareCount')).toBe(true);
    expect(isPublic('incrementAngularSeniorGuideShareCount')).toBe(true);
  });

  function isPublic(methodName: keyof ContentMetricsController) {
    return Reflect.getMetadata(
      IS_PUBLIC_KEY,
      ContentMetricsController.prototype[methodName],
    );
  }
});
