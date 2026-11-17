import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

const emptyToNull = ({ value }) => (value === '' ? null : value);

export class CreatePromoDto {
  @ApiProperty({ example: 'Vení con tu amiga' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ example: '20% off en la segunda nanoplastia' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsUrl()
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: '2026-11-30T23:59:59.000Z', description: 'Vacío = sin vencimiento' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsDateString()
  validUntil?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

export class UpdatePromoDto extends PartialType(CreatePromoDto) {}
