import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'admin@rakium.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  /** Ignored; allowed so requests with extra props (e.g. clientId) do not get 400. */
  @IsString()
  @IsOptional()
  clientId?: string;
} 