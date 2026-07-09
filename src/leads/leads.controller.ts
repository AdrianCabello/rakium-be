import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { CreateLeadActivityDto } from '../dto/create-lead-activity.dto';
import { LeadQueryDto } from '../dto/lead-query.dto';
import { ConvertLeadDto } from '../dto/convert-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiOperation({ summary: 'Get lead stats for prospecting dashboard' })
  @Get('stats')
  stats() {
    return this.leadsService.stats();
  }

  @ApiOperation({ summary: 'Get all leads with filters and pagination' })
  @Get()
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @ApiOperation({ summary: 'Create a lead' })
  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @ApiOperation({ summary: 'Get one lead with full activity history' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @ApiOperation({ summary: 'Bulk import or update leads' })
  @Post('bulk')
  bulk(@Body() body: { leads: CreateLeadDto[] }) {
    return this.leadsService.bulkUpsert(body?.leads ?? []);
  }

  @ApiOperation({ summary: 'Update a lead' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: Partial<CreateLeadDto>) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @ApiOperation({ summary: 'Add activity to a lead' })
  @Post(':id/activities')
  addActivity(@Param('id') id: string, @Body() createActivityDto: CreateLeadActivityDto) {
    return this.leadsService.addActivity(id, createActivityDto);
  }

  @ApiOperation({ summary: 'Convert a lead into a client' })
  @Post(':id/convert')
  convert(@Param('id') id: string, @Body() convertLeadDto: ConvertLeadDto) {
    return this.leadsService.convertToClient(id, convertLeadDto);
  }
}
