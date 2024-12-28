import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 3600000 } })
  @Post(':postId')
  async create(
    @AuthUser() user,
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    await this.commentsService.create(user.id, postId, createCommentDto);
    return {
      statusCode: 201,
      message: 'Comment successfully submitted',
    };
  }
}
