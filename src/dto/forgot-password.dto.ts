import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email del usuario que necesita recuperar acceso',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  email: string;
}
