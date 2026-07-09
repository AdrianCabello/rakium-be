import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { PaginationDto } from './pagination.dto';

export const LEAD_CONTACT_FILTERS = ['any', 'instagram', 'email', 'phone'] as const;
export type LeadContactFilter = (typeof LEAD_CONTACT_FILTERS)[number];

export class LeadQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsIn(LEAD_CONTACT_FILTERS)
  contact?: LeadContactFilter;
}
