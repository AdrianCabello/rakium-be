import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SellerActivityType } from '@prisma/client';

export class CreateSellerActivityDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsEnum(SellerActivityType)
  type: SellerActivityType;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;
}
