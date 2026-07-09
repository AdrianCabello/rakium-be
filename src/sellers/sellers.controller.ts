import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignSellerLeadsDto } from '../dto/assign-seller-leads.dto';
import { CreateSellerActivityDto } from '../dto/create-seller-activity.dto';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { SellerQueryDto } from '../dto/seller-query.dto';
import { SellersService } from './sellers.service';

@ApiTags('sellers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @ApiOperation({ summary: 'Get seller dashboard stats' })
  @Get('stats')
  stats() {
    return this.sellersService.stats();
  }

  @ApiOperation({ summary: 'Get sellers with activity summary' })
  @Get()
  findAll(@Query() query: SellerQueryDto) {
    return this.sellersService.findAll(query);
  }

  @ApiOperation({ summary: 'Create seller' })
  @Post()
  create(@Body() createSellerDto: CreateSellerDto) {
    return this.sellersService.create(createSellerDto);
  }

  @ApiOperation({ summary: 'Get seller detail' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update seller' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSellerDto: Partial<CreateSellerDto>) {
    return this.sellersService.update(id, updateSellerDto);
  }

  @ApiOperation({ summary: 'Assign leads to seller' })
  @Post(':id/assign-leads')
  assignLeads(@Param('id') id: string, @Body() body: AssignSellerLeadsDto) {
    return this.sellersService.assignLeads(id, body.leadIds);
  }

  @ApiOperation({ summary: 'Record seller contact, visit, or follow-up' })
  @Post(':id/activities')
  addActivity(@Param('id') id: string, @Body() createActivityDto: CreateSellerActivityDto) {
    return this.sellersService.addActivity(id, createActivityDto);
  }
}
