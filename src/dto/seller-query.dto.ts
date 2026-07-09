import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SellerStatus } from '@prisma/client';
import { PaginationDto } from './pagination.dto';

export class SellerQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus;

  @IsOptional()
  @IsString()
  city?: string;
}
