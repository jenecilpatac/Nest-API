import { Module } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';
import { MessageAttachmentsController } from './message-attachments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessageAttachmentsController],
  providers: [MessageAttachmentsService],
})
export class MessageAttachmentsModule {}
