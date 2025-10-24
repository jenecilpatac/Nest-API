import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { DEFAULT_CHAT_MESSAGES_TAKE } from '../../common/utils/constants';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    CreateChatDto: CreateChatDto,
    senderId: string,
    receiverId: string,
    attachments?: Express.Multer.File[],
  ) {
    let errors: any = {};

    const { content, attachment, parentId } = CreateChatDto;

    const boolAttachment = attachment === 'true';

    if (!content?.trim() && !boolAttachment) {
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

    const attachmentsToAttach = boolAttachment
      ? attachments.map((file) => ({
          userId: senderId,
          value: file.path?.replace(/\\/g, '/'),
        }))
      : [];

    if (existingConvo) {
      const sent = await this.prisma.messages.create({
        data: {
          chatId: existingConvo.id,
          content,
          attachment: boolAttachment,
          userId: senderId,
          parentId: Number(parentId),
          message_attachments: {
            createMany: {
              data: attachmentsToAttach,
            },
          },
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
      const chats = await this.prisma.chats.create({
        data: {
          senderId,
          receiverId,
          messages: {
            create: {
              content,
              attachment: boolAttachment,
              userId: senderId,
              message_attachments: {
                createMany: {
                  data: attachmentsToAttach,
                },
              },
            },
          },
        },
      });

      return chats;
    }
  }

  async getRecentChats(userId: any, query: any): Promise<any> {
    const { take, searchTerm }: any = query;
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
          take: 1,
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
            _count: {
              select: {
                message_attachments: true,
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
      select: {
        profile_pictures: {
          take: 1,
          select: {
            avatar: true,
            isSet: true,
          },
          where: {
            isSet: true,
          },
        },
        id: true,
        name: true,
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });

    const totalSearchedData = await this.prisma.users.count({
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
    });

    const totalConvosData = await this.prisma.chats.count({
      where: {
        OR: [{ receiverId: userId }, { senderId: userId }],
      },
    });

    return {
      parsedChats: searchTerm ? [] : chats,
      searchedData: searchTerm ? searchedData : [],
      totalSearchedData: searchTerm ? totalSearchedData : 0,
      totalConvosData: searchTerm ? totalSearchedData : totalConvosData,
    };
  }
}
