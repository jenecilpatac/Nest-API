import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}
  create(userId: string, postId: number, createCommentDto: CreateCommentDto) {
    return this.prisma.comments.create({
      data: {
        userId: userId,
        postId: postId,
        ...createCommentDto,
      },
    });
  }
}
