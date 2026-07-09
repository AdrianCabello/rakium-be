import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignSellerLeadsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  leadIds: string[];
}
