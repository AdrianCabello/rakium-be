import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadActivityType } from '@prisma/client';

export class CreateLeadActivityDto {
  @IsEnum(LeadActivityType)
  type: LeadActivityType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
