import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { posts } from '@prisma/client';
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPosts(): Promise<any> {
    const posts = await this.postService.findAll();

    if (posts.length === 0) {
      return {
        statusCode: 404,
        message: 'No posts found',
        posts: posts,
      };
    }
    return {
      statusCode: 200,
      posts: posts,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  async createPost(@Body() createPostDto: CreatePostDto): Promise<posts> {
    return this.postService.create(createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPostById(@Param('id') id: number): Promise<any> {
    const post = await this.postService.findOne(id);
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
}
