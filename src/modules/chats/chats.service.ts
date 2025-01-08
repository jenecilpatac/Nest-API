import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  getAllChats() {
    return this.prisma.chats.findMany({
      include: {
        messages: true,
      },
    });
  }

  async create(
    CreateChatDto: CreateChatDto,
    senderId: string,
    receiverId: string,
  ) {
    let errors: any = {};

    const { content, attachment } = CreateChatDto;

    if (!content && !attachment) {
      errors.content = { message: 'Content is required' };
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const existingConvo = await this.prisma.chats.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingConvo) {
      const sent = this.prisma.messages.create({
        data: {
          chatId: existingConvo.id,
          content,
          attachment,
          userId: senderId,
        },
      });

      if (sent) {
        await this.prisma.chats.update({
          where: {
            id: existingConvo.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
      }

      return sent;
    } else {
      return this.prisma.chats.create({
        data: {
          senderId,
          receiverId,
          messages: {
            create: {
              content,
              attachment,
              userId: senderId,
            },
          },
        },
      });
    }
  }

  getRecentChats(userId: any) {
    return this.prisma.chats.findMany({
      where: {
        OR: [{ receiverId: userId }, { senderId: userId }],
      },
      include: {
        messages: {
          include: {
            chat: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        sender: {
          select: {
            name: true,
            id: true,
            profile_pictures: {
              select: {
                avatar: true,
                isSet: true,
              },
              where: {
                isSet: true,
              },
            },
          },
        },
        receiver: {
          select: {
            name: true,
            id: true,
            profile_pictures: {
              select: {
                avatar: true,
                isSet: true,
              },
              where: {
                isSet: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}
