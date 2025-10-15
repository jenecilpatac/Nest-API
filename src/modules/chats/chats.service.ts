import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { DEFAULT_CHAT_MESSAGES_TAKE } from '../../common/utils/constants';
import { getLinkPreview } from 'link-preview-js';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getRecentChats(userId: any, query: any): Promise<any> {
    const { take, searchTerm, takeMessages }: any = query;
    const chats = await this.prisma.chats.findMany({
      where: {
        OR: [
          {
            receiverId: userId,
          },
          {
            senderId: userId,
          },
        ],
      },
      take: parseInt(take) || DEFAULT_CHAT_MESSAGES_TAKE,
      include: {
        messages: {
          take: parseInt(takeMessages) || DEFAULT_CHAT_MESSAGES_TAKE,
          include: {
            chat: {
              include: {
                _count: {
                  select: {
                    messages: {
                      where: {
                        isSeen: false,
                        chatId: {
                          not: null,
                        },
                        userId: {
                          not: userId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            messages: true,
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

    function parsedItem(message: any) {
      const urlPattern =
        /\b(https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(?:\/[^\s]*)?|https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?|(?<!@)\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b(?!@))\b/g;
      const contentFormat = message.content.match(urlPattern) || [];
      const link = contentFormat[0]?.startsWith('http')
        ? contentFormat[0]
        : contentFormat[0] && `https://${contentFormat[0]}`;

      return link;
    }

    const parsedChats = await Promise.all(
      chats.map(async (chat: any) => {
        const { messages, ...data } = chat;
        const parsedMessage = await Promise.all(
          messages.map(async (message: any) => {
            const link = parsedItem(message);
            const data = link
              ? await getLinkPreview(link, {
                  followRedirects: 'follow',
                  timeout: 5000,
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                  },
                })
              : null;

            return {
              ...message,
              link: data ?? null,
            };
          }),
        );

        return {
          ...data,
          messages: parsedMessage,
        };
      }),
    );

    const searchedData = await this.prisma.users.findMany({
      take: parseInt(take) || DEFAULT_CHAT_MESSAGES_TAKE,
      where:
        searchTerm && 'anonymous'.includes(searchTerm.toLowerCase().trim())
          ? { name: null }
          : searchTerm
            ? {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              }
            : {},
      include: {
        profile_pictures: {
          select: {
            avatar: true,
            isSet: true,
          },
          where: {
            isSet: true,
          },
        },
        senderChats: true,
        receiverChats: true,
        _count: {
          select: {
            messages: {
              where: {
                chatId: {
                  not: null,
                },
              },
            },
          },
        },
        messages: {
          where: {
            chatId: {
              not: null,
            },
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });

    const totalSearchedData = await this.prisma.users.count({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            name: searchTerm === 'Anonymous' ? null : undefined,
          },
          {
            name: searchTerm === '' ? '' : undefined,
          },
        ],
      },
    });

    const totalConvosData = await this.prisma.chats.count({
      where: {
        OR: [{ receiverId: userId }, { senderId: userId }],
      },
    });

    return {
      parsedChats,
      searchedData,
      totalSearchedData,
      totalConvosData,
    };
  }
}
