import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGalleryDto {
  @ApiProperty({
    description: 'URL de la imagen',
    example: 'https://ejemplo.com/imagen.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'Título de la imagen',
    example: 'Vista frontal del proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Descripción de la imagen',
    example: 'Vista frontal del proyecto terminado',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Orden de la imagen en la galería',
    example: 1,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
} 