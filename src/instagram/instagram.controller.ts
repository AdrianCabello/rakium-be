import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InstagramConversationQueryDto } from '../dto/instagram-conversation-query.dto';
import { LinkInstagramConversationDto } from '../dto/link-instagram-conversation.dto';
import { InstagramService } from './instagram.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

@ApiTags('instagram')
@Controller('integrations/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @ApiOperation({ summary: 'Verify Instagram webhook challenge' })
  @Get('webhook')
  verifyWebhook(@Query() query: Record<string, string>) {
    return this.instagramService.verifyChallenge(query['hub.mode'], query['hub.verify_token'], query['hub.challenge']);
  }

  @ApiOperation({ summary: 'Receive Instagram Messaging webhook events' })
  @Post('webhook')
  receiveWebhook(
    @Body() payload: any,
    @Req() req: RawBodyRequest,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    this.instagramService.verifySignature(signature, req.rawBody);
    return this.instagramService.receiveWebhook(payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Instagram integration setup status' })
  @Get('setup')
  setup() {
    return this.instagramService.getSetup();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List Instagram conversations' })
  @Get('conversations')
  findAll(@Query() query: InstagramConversationQueryDto) {
    return this.instagramService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Instagram conversation detail' })
  @Get('conversations/:id')
  findOne(@Param('id') id: string) {
    return this.instagramService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Link Instagram conversation to a lead' })
  @Patch('conversations/:id/link-lead')
  linkLead(@Param('id') id: string, @Body() body: LinkInstagramConversationDto) {
    return this.instagramService.linkLead(id, body.leadId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Archive Instagram conversation' })
  @Patch('conversations/:id/archive')
  archive(@Param('id') id: string) {
    return this.instagramService.archive(id);
  }
}
