import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    console.log(`🔑 JWT Strategy - Validating payload:`, {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      clientId: payload.clientId,
      exp: payload.exp,
      iat: payload.iat
    });

    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      clientId: payload.clientId,
    };

    console.log(`🔑 JWT Strategy - Returning user:`, user);
    return user;
  }
} 