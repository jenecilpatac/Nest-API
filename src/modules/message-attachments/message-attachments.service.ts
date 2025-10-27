import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageAttachmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPublicAttachments() {
    return await this.prismaService.message_attachments.findMany({
      where: {
        message: {
          chatId: null,
          isDeleted: false,
        },
      },
      select: {
        id: true,
        value: true,
      },
    });
  }

  async getAllPrivateAttachments(userId: string, receiverId: string) {
    const chatId = await this.prismaService.chats.findFirst({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: userId,
          },
        ],
      },
    });

    return await this.prismaService.message_attachments.findMany({
      where: {
        message: {
          chatId: chatId.id,
          isDeleted: false,
        },
      },
      select: {
        id: true,
        value: true,
      },
    });
  }
}
