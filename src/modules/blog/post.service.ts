import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { posts } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<posts[]> {
    return this.prisma.posts.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        category: true,
      },
    });
  }

  create(createPostDto: CreatePostDto, userId: string): Promise<posts> {
    const { categoryId, ...datas } = createPostDto;
    return this.prisma.posts.create({
      data: {
        ...datas,
        categoryId: Number(categoryId),
        userId,
      },
    });
  }

  findById(id: number) {
    return this.prisma.posts.findUnique({ where: { id } });
  }

  delete(id: number) {
    return this.prisma.posts.delete({ where: { id } });
  }
}
