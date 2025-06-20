import { IsString, IsOptional, IsNumber, Min, Matches, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVideoDto {
  @ApiProperty({
    description: 'Video title',
    example: 'Video promocional del proyecto',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Video description',
    example: 'Video que muestra el proceso de construcción',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'YouTube video URL',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @ApiProperty({
    description: 'Video order in project',
    example: 1,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
} 