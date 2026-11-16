import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

const emptyToNull = ({ value }) => (value === '' ? null : value);

export class CreateProfessionalDto {
  @ApiProperty({ example: 'Celina Gómez' })
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'Estilista', description: 'Profesión o área' })
  @IsString()
  @MaxLength(120)
  role: string;

  @ApiPropertyOptional({ example: 'MP 1234' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(60)
  license?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(2000)
  bio?: string | null;

  @ApiPropertyOptional({ example: 'https://storage.googleapis.com/bucket/pro.webp' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsUrl()
  photoUrl?: string | null;

  @ApiPropertyOptional({ example: '5492262123456' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(30)
  whatsapp?: string | null;

  @ApiPropertyOptional({ example: 'celinagstudio' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(60)
  instagram?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

export class UpdateProfessionalDto extends PartialType(CreateProfessionalDto) {}
