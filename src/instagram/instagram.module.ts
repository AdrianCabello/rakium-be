import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';

@Module({
  imports: [PrismaModule],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
