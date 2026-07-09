import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InstagramConversationStatus } from '@prisma/client';
import { PaginationDto } from './pagination.dto';

export class InstagramConversationQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(InstagramConversationStatus)
  status?: InstagramConversationStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
