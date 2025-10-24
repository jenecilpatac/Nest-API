import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesGateway } from './chat-messages.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatMessagesController } from './chat-messages.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './storage/message-attachments-uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  ],
  providers: [ChatMessagesGateway, ChatMessagesService],
  controllers: [ChatMessagesController],
})
export class ChatMessagesModule {}
