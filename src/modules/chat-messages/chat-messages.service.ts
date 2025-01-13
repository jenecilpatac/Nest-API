import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  async findAll(take: string) {
    const messages = await this.prisma.messages.findMany({
      where: {
        chatId: null,
      },
      take: parseInt(take),
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
}
