import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Client name',
    example: 'Empresa XYZ',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Client email',
    example: 'contacto@empresaxyz.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 