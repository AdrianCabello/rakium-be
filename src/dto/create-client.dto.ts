import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    description: 'Identificador público del sitio (GET /public/sites/:slug)',
    example: 'celinagstudio',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({
    description: 'URL del sitio del cliente; el link de "olvidé mi contraseña" apunta ahí',
    example: 'https://celinagstudio.com',
  })
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  siteUrl?: string;
}
