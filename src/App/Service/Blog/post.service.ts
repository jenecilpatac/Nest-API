import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../../../Rules/DTO/Blog/create-post.dto';
import { PrismaService } from '../../Prisma/Service/prisma.service';
import { posts } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<posts[]> {
    return this.prisma.posts.findMany();
  }

  async create(createPostDto: CreatePostDto): Promise<posts | any> {
    const user = await this.prisma.users.findUnique({
      where: { id: createPostDto.userId },
    });
    if (!user) {
      throw new Error('User ID does not exist');
    }

    return this.prisma.posts.create({
      data: {
        ...createPostDto,
        userId: user.id,
      },
    });
  }

  findOne(id: number): Promise<posts> {
    return this.prisma.posts.findUnique({ where: { id } });
  }
}
