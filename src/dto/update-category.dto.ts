import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Nombre de la categoría', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Valor único (slug)', required: false })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ description: 'Orden de visualización', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderNum?: number;
}
