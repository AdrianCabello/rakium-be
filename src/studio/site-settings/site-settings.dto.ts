import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';

const emptyToNull = ({ value }) => (value === '' ? null : value);
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class OpeningHoursDto {
  @ApiPropertyOptional({ example: 1, description: '0 = domingo ... 6 = sábado' })
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @ApiPropertyOptional({ example: '09:00' })
  @Matches(TIME)
  open: string;

  @ApiPropertyOptional({ example: '19:00' })
  @Matches(TIME)
  close: string;
}

export class UpdateSiteSettingsDto {
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

  @ApiPropertyOptional({ example: 'Calle 68 N° 3221, Necochea' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiPropertyOptional({ example: 'https://maps.app.goo.gl/...' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsUrl()
  mapsUrl?: string | null;

  @ApiPropertyOptional({ description: 'Foto del antes de la portada (URL de /upload/image)' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  heroBefore?: string | null;

  @ApiPropertyOptional({ description: 'Foto del después de la portada (URL de /upload/image)' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  heroAfter?: string | null;

  @ApiPropertyOptional({ type: [OpeningHoursDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  schedule?: OpeningHoursDto[];
}
