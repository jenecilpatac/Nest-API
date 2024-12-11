import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { categories } from '@prisma/client';

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

  create(createCategoryDto: CreateCategoryDto): Promise<categories | any> {
    return this.prisma.categories.create({
      data: {
        ...createCategoryDto,
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
        posts: true,
      },
    });
  }
}
