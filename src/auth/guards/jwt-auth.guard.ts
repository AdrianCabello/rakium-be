import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(`🔐 JWT Guard - Endpoint: ${request.method} ${request.url}`);
    console.log(`🔐 JWT Guard - Is Public: ${isPublic}`);
    console.log(`🔐 JWT Guard - Authorization Header: ${request.headers.authorization ? 'Present' : 'Missing'}`);
    
    if (request.headers.authorization) {
      const token = request.headers.authorization.replace('Bearer ', '');
      console.log(`🔐 JWT Guard - Token: ${token.substring(0, 20)}...`);
    }

    if (isPublic) {
      console.log(`🔐 JWT Guard - Allowing public access`);
      return true;
    }

    console.log(`🔐 JWT Guard - Requiring authentication`);
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log(`🔐 JWT Guard - Handle Request - Error: ${err ? 'Yes' : 'No'}`);
    console.log(`🔐 JWT Guard - Handle Request - User: ${user ? 'Present' : 'Missing'}`);
    console.log(`🔐 JWT Guard - Handle Request - Info: ${info}`);
    
    if (err || !user) {
      console.log(`🔐 JWT Guard - Authentication failed: ${err || info}`);
    }

    return super.handleRequest(err, user, info, context);
  }
} 