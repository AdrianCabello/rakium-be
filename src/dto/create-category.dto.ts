import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nombre de la categoría', example: 'Estaciones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Valor único (slug)', example: 'ESTACIONES' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Orden de visualización', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderNum?: number;
}
