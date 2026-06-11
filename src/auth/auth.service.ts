import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.validateUser(email, password);
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
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

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return this.passwordResetRequestResponse();
    }

    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashPasswordResetToken(token);
    const expiresAt = new Date(
      Date.now() + this.getPasswordResetTtlMinutes() * 60 * 1000,
    );

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.mailService.sendPasswordResetEmail(
      user.email,
      this.buildPasswordResetUrl(token),
    );

    return this.passwordResetRequestResponse();
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashPasswordResetToken(token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date()
    ) {
      throw new BadRequestException(
        'El link de recuperación no es válido o venció',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Contraseña actualizada correctamente' };
  }

  private hashPasswordResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildPasswordResetUrl(token: string) {
    const baseUrl =
      this.configService.get<string>('PASSWORD_RESET_URL_BASE') ||
      'https://landicandela.com/reset-password';
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  private getPasswordResetTtlMinutes() {
    const ttl = Number(
      this.configService.get<string>('PASSWORD_RESET_TTL_MINUTES') || '60',
    );
    return Number.isFinite(ttl) && ttl > 0 ? ttl : 60;
  }

  private passwordResetRequestResponse() {
    return {
      message:
        'Si el email existe, enviaremos instrucciones para recuperar la contraseña',
    };
  }
}
