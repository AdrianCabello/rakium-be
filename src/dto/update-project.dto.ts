import { IsBoolean, IsEnum, IsOptional, IsString, IsNumber, Min, Max, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectCategory, ProjectStatus, ProjectType } from '@prisma/client';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Remodelación de estación de servicio',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Tipo del proyecto',
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
    required: false,
  })
  @IsEnum(ProjectCategory)
  @IsOptional()
  category?: ProjectCategory;

  @ApiProperty({
    description: 'Descripción corta del proyecto',
    example: 'Remodelación completa de estación de servicio en zona norte',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Descripción detallada del proyecto',
    example: 'Proyecto de remodelación integral...',
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
    example: 19.4326,
    required: false,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitud de la ubicación del proyecto',
    example: -99.1332,
    required: false,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Dirección formateada del proyecto',
    example: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940 Ciudad de México, CDMX',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'País del proyecto',
    example: 'México',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Estado/Provincia del proyecto',
    example: 'Ciudad de México',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'Ciudad del proyecto',
    example: 'Benito Juárez',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Área del proyecto',
    example: '500m²',
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
    example: '2024-03-15',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  date?: string;

  @ApiProperty({
    description: 'Fecha de inicio del proyecto (formato ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de finalización del proyecto (formato ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'ID del cliente al que pertenece el proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'Desafío del proyecto',
    example: 'Mantener operaciones durante la remodelación',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  challenge?: string;

  @ApiProperty({
    description: 'Solución implementada',
    example: 'Trabajo por fases y horarios especiales',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  solution?: string;

  @ApiProperty({
    description: 'URL del proyecto',
    example: 'https://ejemplo.com/proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  url?: string;

  @ApiProperty({
    description: 'ID del usuario creador',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  createdBy?: string;
} 