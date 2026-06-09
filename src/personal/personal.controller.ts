import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PersonalTaskStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateFinanceAccountDto,
  CreateFinanceCategoryDto,
  CreateFinanceTransactionDto,
  CreatePersonalNoteDto,
  CreatePersonalTaskDto,
  UpdatePersonalNoteDto,
  UpdatePersonalTaskDto,
} from './dto/personal.dto';
import { PersonalService } from './personal.service';

@ApiTags('personal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Get('bootstrap')
  @ApiOperation({ summary: 'Get client personal dashboard base data' })
  bootstrap(@Request() req) {
    return this.personalService.bootstrap(req.user);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get personal dashboard summary for authenticated client' })
  summary(@Request() req) {
    return this.personalService.summary(req.user);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'List personal tasks for authenticated client' })
  @ApiQuery({ name: 'status', required: false, enum: PersonalTaskStatus })
  listTasks(@Request() req, @Query('status') status?: PersonalTaskStatus) {
    return this.personalService.listTasks(req.user, status);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a personal task' })
  createTask(@Request() req, @Body() dto: CreatePersonalTaskDto) {
    return this.personalService.createTask(req.user, dto);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a personal task' })
  updateTask(@Request() req, @Param('id') id: string, @Body() dto: UpdatePersonalTaskDto) {
    return this.personalService.updateTask(req.user, id, dto);
  }

  @Get('notes')
  @ApiOperation({ summary: 'List personal notes and brain dump items' })
  listNotes(@Request() req) {
    return this.personalService.listNotes(req.user);
  }

  @Post('notes')
  @ApiOperation({ summary: 'Create a personal note or brain dump item' })
  createNote(@Request() req, @Body() dto: CreatePersonalNoteDto) {
    return this.personalService.createNote(req.user, dto);
  }

  @Patch('notes/:id')
  @ApiOperation({ summary: 'Update a personal note' })
  updateNote(@Request() req, @Param('id') id: string, @Body() dto: UpdatePersonalNoteDto) {
    return this.personalService.updateNote(req.user, id, dto);
  }

  @Get('finance')
  @ApiOperation({ summary: 'List accounts, categories and recent transactions' })
  listFinance(@Request() req) {
    return this.personalService.listFinance(req.user);
  }

  @Post('finance/accounts')
  @ApiOperation({ summary: 'Create a finance account' })
  createFinanceAccount(@Request() req, @Body() dto: CreateFinanceAccountDto) {
    return this.personalService.createFinanceAccount(req.user, dto);
  }

  @Post('finance/categories')
  @ApiOperation({ summary: 'Create a finance category' })
  createFinanceCategory(@Request() req, @Body() dto: CreateFinanceCategoryDto) {
    return this.personalService.createFinanceCategory(req.user, dto);
  }

  @Post('finance/transactions')
  @ApiOperation({ summary: 'Create a finance transaction' })
  createFinanceTransaction(@Request() req, @Body() dto: CreateFinanceTransactionDto) {
    return this.personalService.createFinanceTransaction(req.user, dto);
  }
}
