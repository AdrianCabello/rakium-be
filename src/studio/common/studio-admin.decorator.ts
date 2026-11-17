import { applyDecorators, createParamDecorator, ExecutionContext, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';

/** Endpoints del panel: JWT + rol ADMIN o CLIENT_ADMIN. */
export const StudioAdmin = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiQuery({ name: 'clientId', required: false, description: 'Solo ADMIN: operar sobre otro cliente' }),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('ADMIN', 'CLIENT_ADMIN'),
  );

type RequestUser = { role: string; clientId?: string | null };

/**
 * Resuelve el cliente sobre el que se opera. Siempre sale del JWT;
 * solo un ADMIN puede indicar otro con ?clientId=.
 */
export function resolveClientId(user: RequestUser | undefined, override?: string): string {
  if (user?.role === 'ADMIN' && override) return override;
  if (!user?.clientId) {
    throw new ForbiddenException('El usuario autenticado no tiene cliente asociado');
  }
  return user.clientId;
}

export const ClientId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  return resolveClientId(request.user, request.query?.clientId);
});
