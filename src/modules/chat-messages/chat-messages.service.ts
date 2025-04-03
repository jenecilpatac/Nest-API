import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_CHAT_MESSAGES_TAKE } from '../../common/utils/constants';
import { getLinkPreview } from 'link-preview-js';

@Injectable()
export class ChatMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createChatMessageDto: CreateChatMessageDto, userId: string) {
    let errors: any = {};

    const { content, attachment } = createChatMessageDto;

    if (!content && !attachment) {
      errors.content = { message: 'Content is required' };
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.messages.create({
      data: {
        chatId: null,
        userId,
        content,
        attachment,
      },
    });
  }

  async findAll(params: any) {
    const { take } = params;

    const messages = await this.prisma.messages.findMany({
      where: {
        chatId: null,
      },
      take: parseInt(take) || DEFAULT_CHAT_MESSAGES_TAKE,
      include: {
        sentBy: {
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
        createdAt: 'desc',
      },
    });

    const totalData = await this.prisma.messages.count({
      where: {
        chatId: null,
      },
    });

    return {
      messages,
      totalData,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} chatMessage`;
  }

  update(id: number, updateChatMessageDto: UpdateChatMessageDto) {
    return `This action updates a #${id} chatMessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatMessage`;
  }

  async seenMessage(receiverId: string, chatId: number) {
    const messagesToSeen = await this.prisma.messages.updateMany({
      where: {
        chatId,
        userId: receiverId,
        isSeen: false,
      },
      data: {
        isSeen: true,
      },
    });

    return { messagesToSeen };
  }

  async linkPreview(previewData: any) {
    const previews = await Promise.all(
      previewData.map(async ({ link, messageId }) => {
        try {
          const data = await getLinkPreview(link, {
            followRedirects: 'follow',
            timeout: 5000,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            },
          });
          return { ...data, messageId };
        } catch (error) {
          console.error(`Error fetching preview for ${link}:`, error);
          return { error: 'Failed to fetch preview', link, messageId };
        }
      }),
    );

    return { linkPreviews: previews };
  }
}
