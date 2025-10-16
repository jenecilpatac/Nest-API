import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Get('public-messages')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async findAll(@Query() query) {
    return await this.chatMessagesService.findAll(query);
  }

  @Post('send-public-message')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  createPublicMessage(
    @AuthUser() user,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ) {
    return this.chatMessagesService.create(createChatMessageDto, user.id);
  }

  @Patch('seen-message/:receiverId/:chatId')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async seenMessages(@Param('receiverId') receiverId, @Param('chatId') chatId) {
    const isSeenMessage = await this.chatMessagesService.seenMessage(
      receiverId,
      parseInt(chatId),
    );

    return {
      status: 200,
      message: 'Messages seen successfully',
      data: isSeenMessage.messagesToSeen,
    };
  }

  @Post('link-preview')
  @SkipThrottle()
  async getPreview(@Body('previewData') previewData) {
    return this.chatMessagesService.linkPreview(previewData);
  }

  @Get('private/:id/messages')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('id') userId: string,
    @AuthUser() user,
    @Query() query,
  ) {
    const messages = await this.chatMessagesService.privateMessages(
      userId,
      user.id,
      query,
    );

    return {
      status: 200,
      message: 'Messages fetched successfully',
      messages: messages.parsedChats,
      totalConvosData: messages.totalConvosData,
    };
  }
}
