import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { categories } from '@prisma/client';
import { ValidationError } from 'yup';
import { CreateCategoryDto } from './dto/create-category.dto';

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

  findBySlug(slug: string): Promise<any> {
    return this.prisma.categories.findFirst({
      where: { slug },
      include: {
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
        },
      },
    });
  }
}
