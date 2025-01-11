import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { posts } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<posts[]> {
    return this.prisma.posts.findMany({
      where: {
        publishedAs: {
          notIn: ['private'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
            profile_pictures: {
              select: {
                isSet: true,
                avatar: true,
              },
              where: {
                isSet: true,
              },
            },
          },
        },
        category: true,
        likes: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
                  },
                  where: {
                    isSet: true,
                  },
                },
              },
            },
          },
        },
        comments: {
          select: {
            userId: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                username: true,
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
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
        },
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
    return this.prisma.posts.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile_pictures: {
              select: {
                isSet: true,
                avatar: true,
              },
              where: {
                isSet: true,
              },
            },
          },
        },
        category: true,
        likes: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
                  },
                  where: {
                    isSet: true,
                  },
                },
              },
            },
          },
        },
        comments: {
          select: {
            userId: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
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
        },
      },
    });
  }

  delete(id: number) {
    return this.prisma.posts.delete({ where: { id } });
  }

  async like(postId: number, userId: string) {
    const like = await this.prisma.likes.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    if (like) {
      return this.prisma.likes.deleteMany({
        where: {
          postId: postId,
          userId: userId,
        },
      });
    }

    return this.prisma.likes.create({
      data: {
        postId,
        userId,
      },
    });
  }

  userPosts(userId: string) {
    return this.prisma.posts.findMany({
      where: {
        userId: userId,
      },
      include: {
        category: true,
        user: {
          include: {
            profile_pictures: {
              select: {
                isSet: true,
                avatar: true,
              },
              where: {
                isSet: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
                  },
                  where: {
                    isSet: true,
                  },
                },
              },
            },
          },
        },
        comments: {
          select: {
            userId: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                profile_pictures: {
                  select: {
                    isSet: true,
                    avatar: true,
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
