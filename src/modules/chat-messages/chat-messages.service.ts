import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_CHAT_MESSAGES_TAKE } from '../../common/utils/constants';
import { getLinkPreview } from 'link-preview-js';
@Injectable()
export class ChatMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createChatMessageDto: CreateChatMessageDto,
    userId: string,
    attachments?: Express.Multer.File[],
  ) {
    let errors: any = {};

    const { content, attachment, parentId } = createChatMessageDto;

    const boolAttachment = attachment === 'true';

    if (!content && !boolAttachment) {
      errors.content = { message: 'Content is required' };
    }

    if (Object.keys(errors).length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const attachmentsToAttach = boolAttachment
      ? attachments.map((file) => ({
          userId: userId,
          value: file.path?.replace(/\\/g, '/'),
        }))
      : [];

    const message = await this.prisma.messages.create({
      data: {
        chatId: null,
        userId,
        content,
        attachment: boolAttachment,
        parentId: Number(parentId),
        message_attachments: {
          createMany: {
            data: attachmentsToAttach,
          },
        },
      },
    });

    return message;
  }

  async findAll(params: any): Promise<any> {
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
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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
        },
        parent: {
          select: {
            id: true,
            sentBy: {
              select: {
                name: true,
                id: true,
              },
            },
            userId: true,
            content: true,
            attachment: true,
          },
        },
        seenbies: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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
        },
        message_attachments: {
          select: {
            messageId: true,
            id: true,
            value: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const allMessages = messages.map((message) => {
      if (message.isDeleted) {
        const {
          id,
          seenbies,
          parent,
          isDeleted,
          createdAt,
          updatedAt,
          sentBy,
          userId,
        } = message;

        return {
          id,
          seenbies,
          parent,
          isDeleted,
          createdAt,
          updatedAt,
          content: '',
          reactions: [],
          sentBy,
          userId,
        };
      }
      return message;
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

    const parsedMessages = await Promise.all(
      allMessages.map(async (message) => {
        const link = parsedItem(message);

        let previewData = null;

        if (link) {
          try {
            previewData = await getLinkPreview(link, {
              followRedirects: 'follow',
              timeout: 5000,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
              },
            });
          } catch (error) {
            console.warn(`Failed to fetch preview for ${link}:`, error.message);
            previewData = null;
          }
        }

        return {
          ...message,
          link: previewData,
        };
      }),
    );

    const totalData = await this.prisma.messages.count({
      where: {
        chatId: null,
      },
    });

    return {
      messages: parsedMessages,
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

  async privateMessages(
    userId: string,
    myId: string,
    query: any,
  ): Promise<any> {
    const { takeMessages }: any = query;
    const chats = await this.prisma.chats.findMany({
      where: {
        OR: [
          {
            receiverId: myId,
            senderId: userId,
          },
          {
            receiverId: userId,
            senderId: myId,
          },
        ],
      },
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
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
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
            },
            parent: {
              select: {
                id: true,
                sentBy: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
                userId: true,
                content: true,
                attachment: true,
              },
            },
            message_attachments: {
              select: {
                messageId: true,
                id: true,
                value: true,
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
        const allMessages = messages.map((message) => {
          if (message.isDeleted) {
            const {
              id,
              seenbies,
              parent,
              isDeleted,
              createdAt,
              updatedAt,
              sentBy,
              userId,
              chatId,
              isSeen,
            } = message;

            return {
              id,
              seenbies,
              parent,
              isDeleted,
              createdAt,
              updatedAt,
              content: '',
              reactions: [],
              sentBy,
              userId,
              chatId,
              isSeen,
            };
          }
          return message;
        });

        const parsedMessage = await Promise.all(
          allMessages.map(async (message: any) => {
            const link = parsedItem(message);

            let previewData = null;

            if (link) {
              try {
                previewData = await getLinkPreview(link, {
                  followRedirects: 'follow',
                  timeout: 5000,
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                  },
                });
              } catch (error) {
                console.warn(
                  `Failed to fetch preview for ${link}:`,
                  error.message,
                );
                previewData = null;
              }
            }

            return {
              ...message,
              link: previewData,
            };
          }),
        );

        return {
          ...data,
          messages: parsedMessage,
        };
      }),
    );

    const totalConvosData = await this.prisma.chats.count({
      where: {
        OR: [{ receiverId: userId }, { senderId: userId }],
      },
    });

    return {
      parsedChats,
      totalConvosData,
    };
  }

  async updateMessage(id: number, updateChatMessageDto: UpdateChatMessageDto) {
    return await this.prisma.messages.update({
      where: {
        id,
      },
      data: {
        ...updateChatMessageDto,
      },
    });
  }

  async deleteMessage(id: number) {
    return await this.prisma.messages.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async reactToMessage(
    userId: string,
    messageId: number,
    value: string,
    label: string,
  ) {
    const message = await this.prisma.messages.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const existingReaction = await this.prisma.reactions.findFirst({
      where: {
        userId,
        messageId,
        label,
      },
    });

    if (existingReaction) {
      await this.prisma.reactions.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return {
        message: 'Reaction deleted successfully',
      };
    }

    await this.prisma.reactions.create({
      data: {
        userId,
        messageId: message.id,
        value,
        label,
      },
    });

    return {
      message: 'Reaction added successfully',
    };
  }

  async seenPublicMessage(userId: string, messageId: number) {
    const existsSeen = await this.prisma.seeners.findFirst({
      where: {
        userId,
        messageId,
      },
    });

    const existsMessage = await this.prisma.messages.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!existsMessage || existsSeen) return;

    return await this.prisma.seeners.create({
      data: {
        userId,
        messageId,
      },
    });
  }
}
