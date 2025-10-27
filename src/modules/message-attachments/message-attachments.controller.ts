import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('message-attachments')
export class MessageAttachmentsController {
  constructor(
    private readonly messageAttachmentsService: MessageAttachmentsService,
  ) {}

  @Get('public-message-attachments')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async getAllPublicAttachments() {
    const attachments =
      await this.messageAttachmentsService.getAllPublicAttachments();

    return {
      status: 200,
      attachments,
    };
  }

  @Post('private-message-attachments')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async getAllPrivateAttachments(
    @Body() items: { userId: string; receiverId: string },
  ) {
    const attachments =
      await this.messageAttachmentsService.getAllPrivateAttachments(
        items?.userId,
        items?.receiverId,
      );

    return {
      status: 201,
      attachments,
    };
  }
}
