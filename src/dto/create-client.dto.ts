import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Empresa XYZ',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'contacto@empresaxyz.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 