import { IsUUID } from 'class-validator';

export class LinkInstagramConversationDto {
  @IsUUID()
  leadId: string;
}
