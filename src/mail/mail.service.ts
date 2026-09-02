import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend?: Resend;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from =
      this.configService.get<string>('MAIL_FROM') ||
      'Rakium <no-reply@rakium.dev>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY is not configured; password reset email was not sent.',
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Recuperar contraseña',
      html: this.buildPasswordResetHtml(resetUrl),
      text: `Para recuperar tu contraseña, abrí este link: ${resetUrl}`,
    });

    if (error) {
      this.logger.error(
        `Resend failed to send password reset email: ${error.message}`,
      );
      throw new Error('Password reset email could not be sent');
    }
  }

  private buildPasswordResetHtml(resetUrl: string) {
    return `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h1 style="font-size: 20px;">Recuperar contraseña</h1>
        <p>Recibimos una solicitud para cambiar tu contraseña.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Crear nueva contraseña
          </a>
        </p>
        <p>Este link vence pronto y solo puede usarse una vez.</p>
        <p>Si no pediste este cambio, podés ignorar este email.</p>
      </div>
    `;
  }
}
