import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateServiceCategoryDto {
  @ApiProperty({ example: 'Alisados' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'alisados', description: 'Si no se envía, se genera desde el nombre' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;
}

export class UpdateServiceCategoryDto extends PartialType(CreateServiceCategoryDto) {}
