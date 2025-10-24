import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FilesInterceptor('attachments'))
  @UseGuards(JwtAuthGuard)
  async createPublicMessage(
    @AuthUser() user,
    @Body() createChatMessageDto: CreateChatMessageDto,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    return await this.chatMessagesService.create(
      createChatMessageDto,
      user.id,
      attachments,
    );
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

  @Patch('update/:id/message')
  @Throttle({ default: { limit: 3, ttl: 5000 } })
  @UseGuards(JwtAuthGuard)
  async updateMessage(
    @Param('id') id: string,
    @Body() updateChatMessageDto: UpdateChatMessageDto,
  ) {
    await this.chatMessagesService.updateMessage(
      parseInt(id),
      updateChatMessageDto,
    );

    return {
      status: 200,
      message: 'Message updated successfully',
    };
  }

  @Delete('delete/:id/message')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 5000 } })
  async deleteMessage(@Param('id') id: string) {
    await this.chatMessagesService.deleteMessage(parseInt(id));

    return {
      status: 204,
      message: 'Message deleted successfully',
    };
  }

  @Post('react')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async reactToMessage(
    @AuthUser() user,
    @Body() items: { messageId: number; value: string; label: string },
  ) {
    const response = await this.chatMessagesService.reactToMessage(
      user.id,
      items.messageId,
      items.value,
      items.label,
    );

    return {
      status: 201,
      message: response.message,
    };
  }

  @Post('seen-public-message')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async seenMessage(@AuthUser() user, @Body() items: { messageId: number }) {
    await this.chatMessagesService.seenPublicMessage(user.id, items.messageId);

    return {
      status: 200,
      message: 'Messages seen successfully',
    };
  }
}
