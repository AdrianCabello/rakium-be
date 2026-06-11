import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FinanceAccountType,
  FinanceTransactionType,
  PersonalNoteType,
  PersonalPriority,
  PersonalTaskStatus,
} from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePersonalTaskDto {
  @ApiProperty({ example: 'Planear sprint de adriancabello.dev' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Definir las primeras tareas del MVP' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: PersonalPriority, example: PersonalPriority.HIGH })
  @IsOptional()
  @IsEnum(PersonalPriority)
  priority?: PersonalPriority;

  @ApiPropertyOptional({ enum: PersonalTaskStatus, example: PersonalTaskStatus.TODO })
  @IsOptional()
  @IsEnum(PersonalTaskStatus)
  status?: PersonalTaskStatus;

  @ApiPropertyOptional({ example: '2026-06-09T15:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: '2026-06-09T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  areaId?: string;
}

export class UpdatePersonalTaskDto {
  @ApiPropertyOptional({ example: 'Cerrar dashboard home' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: PersonalPriority })
  @IsOptional()
  @IsEnum(PersonalPriority)
  priority?: PersonalPriority;

  @ApiPropertyOptional({ enum: PersonalTaskStatus })
  @IsOptional()
  @IsEnum(PersonalTaskStatus)
  status?: PersonalTaskStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  areaId?: string;
}

export class CreatePersonalNoteDto {
  @ApiPropertyOptional({ example: 'Idea producto' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ example: 'Bajar esta idea y convertirla en tarea despues.' })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ enum: PersonalNoteType, example: PersonalNoteType.BRAIN_DUMP })
  @IsOptional()
  @IsEnum(PersonalNoteType)
  type?: PersonalNoteType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  areaId?: string;
}

export class UpdatePersonalNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({ enum: PersonalNoteType })
  @IsOptional()
  @IsEnum(PersonalNoteType)
  type?: PersonalNoteType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  areaId?: string;
}

export class CreateFinanceAccountDto {
  @ApiProperty({ example: 'Mercado Pago' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ enum: FinanceAccountType, example: FinanceAccountType.DIGITAL_WALLET })
  @IsOptional()
  @IsEnum(FinanceAccountType)
  type?: FinanceAccountType;

  @ApiPropertyOptional({ example: 'ARS' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  initialBalance?: number;
}

export class CreateFinanceCategoryDto {
  @ApiProperty({ example: 'Herramientas' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: FinanceTransactionType, example: FinanceTransactionType.EXPENSE })
  @IsEnum(FinanceTransactionType)
  type: FinanceTransactionType;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyBudget?: number;

  @ApiPropertyOptional({ example: '#22c55e' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;
}

export class CreateFinanceTransactionDto {
  @ApiProperty({ enum: FinanceTransactionType, example: FinanceTransactionType.EXPENSE })
  @IsEnum(FinanceTransactionType)
  type: FinanceTransactionType;

  @ApiProperty({ example: 12500 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'ARS' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: '2026-06-09T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'SaaS mensual' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'OpenAI' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  merchant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateFinanceTransactionDto {
  @ApiPropertyOptional({ enum: FinanceTransactionType, example: FinanceTransactionType.EXPENSE })
  @IsOptional()
  @IsEnum(FinanceTransactionType)
  type?: FinanceTransactionType;

  @ApiPropertyOptional({ example: 12500 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: 'ARS' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: '2026-06-09T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'SaaS mensual' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'OpenAI' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  merchant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
