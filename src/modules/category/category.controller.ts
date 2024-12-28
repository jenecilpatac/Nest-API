import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { categories } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoriesService: CategoryService) {}

  @Get()
  @SkipThrottle()
  async getAllCategories(): Promise<any> {
    const categories = await this.categoriesService.findAll();

    if (categories.length === 0) {
      return {
        statusCode: 404,
        message: 'No categories added yet.',
        categories: categories,
      };
    }

    return {
      statusCode: 200,
      message: 'Categories fetched successfully.',
      categories: categories,
    };
  }

  @Post('create-category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin', 'moderator')
  @SkipThrottle()
  async createCategory(
    @Body() createCategory: CreateCategoryDto,
  ): Promise<categories | CreateCategoryDto> {
    return this.categoriesService.create(createCategory);
  }

  @Get(':slug')
  @SkipThrottle()
  async getCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);

    if (!category) {
      throw new HttpException(`Category "${slug}" not found.`, 404);
    }

    if (category.posts.length === 0) {
      return {
        statusCode: 404,
        message: `Category "${slug}" has no posts.`,
        category: category,
      };
    }

    return {
      statusCode: 200,
      message: 'Category fetched successfully',
      category,
    };
  }
}
