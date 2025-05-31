import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProjectType, ProjectStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Sitio web corporativo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tipo de proyecto',
    enum: ProjectType,
    example: ProjectType.LANDING,
  })
  @IsEnum(ProjectType)
  @IsNotEmpty()
  type: ProjectType;

  @ApiProperty({
    description: 'Estado del proyecto',
    enum: ProjectStatus,
    example: ProjectStatus.DRAFT,
  })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;

  @ApiProperty({
    description: 'URL del proyecto (opcional)',
    example: 'https://www.ejemplo.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'ID del cliente al que pertenece el proyecto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;
} 