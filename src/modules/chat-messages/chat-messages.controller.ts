import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
    return await this.chatMessagesService.findAll(query.take);
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
}
