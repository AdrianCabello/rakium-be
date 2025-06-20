import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    description: 'Título del video',
    example: 'Video promocional del proyecto',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción del video',
    example: 'Video que muestra el proceso de construcción',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL del video de YouTube',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(.*)?$/,
    {
      message: 'La URL debe ser una URL válida de YouTube',
    }
  )
  youtubeUrl: string;

  @ApiProperty({
    description: 'Orden del video en la lista',
    example: 1,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number = 0;
} 