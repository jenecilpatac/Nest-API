import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './chats.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway],
})
export class ChatsModule {}
