import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ProjectCategory {
  ESTACIONES = 'ESTACIONES',
  TIENDAS = 'TIENDAS',
  COMERCIALES = 'COMERCIALES',
}

export enum ProjectType {
  LANDING = 'LANDING',
  ECOMMERCE = 'ECOMMERCE',
  INMOBILIARIA = 'INMOBILIARIA',
  CUSTOM = 'CUSTOM',
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Remodelación de estación de servicio',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tipo del proyecto',
    enum: ProjectType,
    example: ProjectType.LANDING,
  })
  @IsEnum(ProjectType)
  @IsNotEmpty()
  type: ProjectType;

  @ApiProperty({
    description: 'Categoría del proyecto',
    enum: ProjectCategory,
    example: ProjectCategory.ESTACIONES,
  })
  @IsEnum(ProjectCategory)
  @IsNotEmpty()
  category: ProjectCategory;

  @ApiProperty({
    description: 'Descripción corta del proyecto',
    example: 'Remodelación completa de estación de servicio en zona norte',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Descripción detallada del proyecto',
    example: 'Proyecto de remodelación integral...',
  })
  @IsString()
  @IsNotEmpty()
  longDescription: string;

  @ApiProperty({
    description: 'URL de la imagen antes del proyecto',
    example: 'https://ejemplo.com/antes.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageBefore?: string;

  @ApiProperty({
    description: 'URL de la imagen después del proyecto',
    example: 'https://ejemplo.com/despues.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageAfter?: string;

  @ApiProperty({
    description: 'Latitud de la ubicación del proyecto',
    example: 19.4326,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitud de la ubicación del proyecto',
    example: -99.1332,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Dirección formateada del proyecto',
    example: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'País del proyecto',
    example: 'México',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  country: string;

  @ApiProperty({
    description: 'Estado/Provincia del proyecto',
    example: 'Ciudad de México',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  state: string;

  @ApiProperty({
    description: 'Ciudad del proyecto',
    example: 'Benito Juárez',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  city: string;

  @ApiProperty({
    description: 'Área del proyecto',
    example: '500m²',
  })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiProperty({
    description: 'Duración del proyecto',
    example: '3 meses',
  })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({
    description: 'Fecha del proyecto',
    example: '2024-03-15',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'ID del cliente al que pertenece el proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Desafío del proyecto',
    example: 'Mantener operaciones durante la remodelación',
  })
  @IsString()
  @IsNotEmpty()
  challenge: string;

  @ApiProperty({
    description: 'Solución implementada',
    example: 'Trabajo por fases y horarios especiales',
  })
  @IsString()
  @IsNotEmpty()
  solution: string;

  @ApiProperty({
    description: 'Mostrar en la página principal',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  showOnHomepage?: boolean = true;
} 