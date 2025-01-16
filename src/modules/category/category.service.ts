import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { categories } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DEFAULT_POST_TAKE } from '../../common/utils/constants';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<any[]> {
    return this.prisma.categories.findMany({
      include: {
        posts: true,
      },
    });
  }

  create(createCategory: CreateCategoryDto): Promise<categories | any> {
    return this.prisma.categories.create({
      data: {
        ...createCategory,
      },
    });
  }

  findById(id: number): Promise<any> {
    return this.prisma.categories.findUnique({
      where: { id },
      include: { posts: true },
    });
  }

  async findBySlug(slug: string, take: any): Promise<any> {
    const category = await this.prisma.categories.findFirst({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
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
          orderBy: {
            createdAt: 'desc',
          },
          take: parseInt(take) || DEFAULT_POST_TAKE,
        },
      },
    });
    return category;
  }
}
