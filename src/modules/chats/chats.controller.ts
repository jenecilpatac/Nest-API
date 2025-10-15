import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateChatDto } from './dto/create-chat.dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('sendMessage/:receiverId')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Body() createChatDto: CreateChatDto,
    @AuthUser() user,
    @Param('receiverId') receiverId,
  ) {
    return await this.chatsService.create(createChatDto, user.id, receiverId);
  }

  @Get('conversations')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async getUsersMessages(@AuthUser() user, @Query() query) {
    const conversations = await this.chatsService.getRecentChats(
      user.id,
      query,
    );

    if (conversations?.chats?.length === 0) {
      throw new HttpException('No conversation yet', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: HttpStatus.OK,
      conversations: conversations.parsedChats,
      totalSearchedData: conversations.totalSearchedData,
      totalConvosData: conversations.totalConvosData,
      searchedData: conversations.searchedData,
    };
  }
}
