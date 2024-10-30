import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PostService } from '../../Service/Blog/post.service';
import { Posts as PostEntity } from '../../../Database/Entity/post.entity';
import { CreatePostDto } from '../../../Rules/DTO/Blog/create-post.dto';
import { JwtAuthGuard } from '../../../App/Middleware/jwt-auth.guard';

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
      };
    }
    return {
      statusCode: 200,
      posts: posts,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
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
