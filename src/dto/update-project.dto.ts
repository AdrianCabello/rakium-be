import { IsBoolean, IsEnum, IsOptional, IsString, IsNumber, Min, Max, MaxLength, IsDateString, ValidateNested, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { ProjectCategory, ProjectStatus, ProjectType } from '@prisma/client';

export class AddressDto {
  @ApiProperty({
    description: 'Complete address string',
    example: 'Lobería, Buenos Aires Province, Argentina',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: -38.1634422,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -58.7816955,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Remodelación de estación de servicio',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Project type',
    enum: ProjectType,
    example: ProjectType.LANDING,
    required: false,
  })
  @IsEnum(ProjectType)
  @IsOptional()
  type?: ProjectType;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.DRAFT,
    required: false,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Project category',
    enum: ProjectCategory,
    example: ProjectCategory.ESTACIONES,
    required: false,
  })
  @IsEnum(ProjectCategory, { message: 'category must be one of the following values: ESTACIONES, TIENDAS, COMERCIALES' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  category?: ProjectCategory;

  @ApiProperty({
    description: 'Short project description',
    example: 'Remodelación completa de estación de servicio en zona norte',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Detailed project description',
    example: 'Proyecto de remodelación integral...',
    required: false,
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({
    description: 'URL of the before project image',
    example: 'https://ejemplo.com/antes.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageBefore?: string;

  @ApiProperty({
    description: 'URL of the after project image',
    example: 'https://ejemplo.com/despues.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageAfter?: string;

  @ApiProperty({
    description: 'Project latitude',
    example: 19.4326,
    required: false,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Project longitude',
    example: -99.1332,
    required: false,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Project address object with coordinates',
    example: {
      address: 'Lobería, Buenos Aires Province, Argentina',
      lat: -38.1634422,
      lng: -58.7816955
    },
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiProperty({
    description: 'Project country',
    example: 'México',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Project state',
    example: 'Ciudad de México',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'Project city',
    example: 'Benito Juárez',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Project area',
    example: '500m²',
    required: false,
  })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiProperty({
    description: 'Project duration',
    example: '3 meses',
    required: false,
  })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({
    description: 'Project date',
    example: '2024-03-15',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  date?: string;

  @ApiProperty({
    description: 'Project URL',
    example: 'https://ejemplo.com/proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  url?: string;

  @ApiProperty({
    description: 'Project challenge',
    example: 'Mantener operaciones durante la remodelación',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  challenge?: string;

  @ApiProperty({
    description: 'Project solution',
    example: 'Trabajo por fases y horarios especiales',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  solution?: string;

  @ApiProperty({
    description: 'Project start date',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Project end date',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'ID of the client to which the project belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'ID of the user who created the project',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  createdBy?: string;

  @ApiProperty({
    description: 'Nombre de contacto interno',
    example: 'Juan Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiProperty({
    description: 'Teléfono de contacto interno',
    example: '+52 55 1234 5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    description: 'Email de contacto interno',
    example: 'contacto@empresa.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Presupuesto estimado o real del proyecto',
    example: '$50,000 USD',
    required: false,
  })
  @IsString()
  @IsOptional()
  budget?: string;

  @ApiProperty({
    description: 'Estado de facturación',
    example: 'pendiente',
    required: false,
  })
  @IsString()
  @IsOptional()
  invoiceStatus?: string;

  @ApiProperty({
    description: 'Notas internas o comentarios adicionales',
    example: 'Cliente VIP, requiere atención especial',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Orden de visualización del proyecto (menor número = más arriba)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;
} 