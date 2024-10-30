import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts as PostEntity } from '../../../Database/Entity/post.entity';
import { CreatePostDto } from '../../../Rules/DTO/Blog/create-post.dto';
import { Users } from '../../../Database/Entity/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  findAll(): Promise<PostEntity[]> {
    return this.postRepository.find();
  }

  async create(createPostDto: CreatePostDto): Promise<PostEntity> {
    const user = await this.userRepository.findOne({
      where: { id: createPostDto.user_id },
    });
    if (!user) {
      throw new Error('User ID does not exist');
    }

    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  findOne(id: number): Promise<PostEntity> {
    return this.postRepository.findOne({ where: { id } });
  }
}
