import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesGateway } from './chat-messages.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatMessagesController } from './chat-messages.controller';

@Module({
  imports: [PrismaModule],
  providers: [ChatMessagesGateway, ChatMessagesService],
  controllers: [ChatMessagesController],
})
export class ChatMessagesModule {}
