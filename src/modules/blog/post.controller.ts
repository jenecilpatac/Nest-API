import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { CategoryService } from '../category/category.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  @SkipThrottle()
  async getAllPosts(@Query() query): Promise<any> {
    const posts = await this.postService.findAll(query.take);

    if (posts.length === 0) {
      return {
        statusCode: 404,
        message: 'No posts found',
        posts: posts,
      };
    }

    return {
      statusCode: 200,
      message: 'Successfully fetched all posts',
      posts: posts.posts,
      totalData: posts.totalData,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  @UseInterceptors(FilesInterceptor('image'))
  @SkipThrottle()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @AuthUser() user,
    @UploadedFiles() image: Express.Multer.File[],
  ): Promise<any> {
    let imageFilenames: string[] = [];

    if (!image || image.length === 0) {
      createPostDto.image = [];
    } else {
      try {
        for (const img of image) {
          await new ParseFilePipeBuilder()
            .addFileTypeValidator({
              fileType: /^image\//,
            })
            .addMaxSizeValidator({
              maxSize: 1000000,
            })
            .build({
              errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            })
            .transform(img);
          const normalizedPath = img.path.replace(/\\/g, '/');
          imageFilenames.push(normalizedPath);
        }

        createPostDto.image = imageFilenames;
      } catch (error) {
        if (
          error.response &&
          error.message.includes(
            'Validation failed (expected size is less than 1000000)',
          )
        ) {
          throw new HttpException(
            'File too large, only 1MB is allowed.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        } else if (
          error.response &&
          error.message.includes('Validation failed (expected type is image/*)')
        ) {
          throw new HttpException(
            'Invalid image type, only jpeg, jpg, png, gif, webp are allowed.',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        } else {
          throw new HttpException(
            `Invalid file type or size: ${error.message}`,
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }
    }

    const category = await this.categoryService.findById(
      Number(createPostDto.categoryId),
    );

    if (!category) {
      throw new HttpException('Category not found', 404);
    }
    const created = await this.postService.create(createPostDto, user.id);
    return {
      statusCode: 201,
      message: 'Post added successfully',
      created,
    };
  }

  @Get(':id')
  @SkipThrottle()
  async getPostById(@Param('id') id: number): Promise<any> {
    const post = await this.postService.findById(id);
    if (!post || isNaN(Number(id))) {
      return {
        statusCode: 404,
        message: `No post found on this id or invalid id`,
      };
    }
    return {
      statusCode: 200,
      post: post,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deletePost(@Param('id') id: number, @AuthUser() user): Promise<any> {
    const post = await this.postService.findById(id);
    if (!post) {
      throw new HttpException(`Post not found with id ${id}`, 404);
    }

    if (post.userId !== user.id) {
      throw new HttpException(`You are not the owner of this post`, 401);
    }

    return this.postService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 100, ttl: 3600000 } })
  @Post('like/:postId')
  likePost(@Param('postId') postId: number, @AuthUser() user) {
    this.postService.like(postId, user.id);
    return {
      statusCode: 201,
      message: 'Post like action processed successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('own/user-posts')
  async getuserPosts(@AuthUser() user) {
    return await this.postService.userPosts(user.id);
  }
}
