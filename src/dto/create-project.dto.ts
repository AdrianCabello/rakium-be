import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ProjectCategory, ProjectStatus, ProjectType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Proyecto de ejemplo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tipo de proyecto',
    enum: ProjectType,
    example: ProjectType.LANDING,
    required: false,
  })
  @IsEnum(ProjectType)
  @IsOptional()
  type?: ProjectType;

  @ApiProperty({
    description: 'Estado del proyecto',
    enum: ProjectStatus,
    example: ProjectStatus.DRAFT,
    required: false,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

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
    example: 'Descripción breve del proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Descripción larga del proyecto',
    example: 'Descripción detallada del proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

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
    example: 40.4168,
    required: false,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitud de la ubicación del proyecto',
    example: -3.7038,
    required: false,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Dirección del proyecto',
    example: 'Calle Principal 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'País del proyecto',
    example: 'España',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
  country?: string;

  @ApiProperty({
    description: 'Estado/Provincia del proyecto',
    example: 'Madrid',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
  state?: string;

  @ApiProperty({
    description: 'Ciudad del proyecto',
    example: 'Madrid',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase())
  city?: string;

  @ApiProperty({
    description: 'Área del proyecto',
    example: '100m²',
    required: false,
  })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiProperty({
    description: 'Duración del proyecto',
    example: '3 meses',
    required: false,
  })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({
    description: 'Fecha del proyecto',
    example: '2024-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({
    description: 'URL del proyecto',
    example: 'https://ejemplo.com/proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'ID del cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Desafío del proyecto',
    example: 'Desafío principal del proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  challenge?: string;

  @ApiProperty({
    description: 'Solución del proyecto',
    example: 'Solución implementada',
    required: false,
  })
  @IsString()
  @IsOptional()
  solution?: string;

  @ApiProperty({
    description: 'Indica si el proyecto debe mostrarse en la página principal',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  showOnHomepage: boolean;
} 