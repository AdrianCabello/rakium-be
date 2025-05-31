import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.validateUser(email, password);
      const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role,
        clientId: user.clientId 
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
} 