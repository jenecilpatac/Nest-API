import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostController } from '../../Controller/Blog/post.controller';
import { PostService } from '../../Service/Blog/post.service';
import { Posts as PostEntity } from '../../../Database/Entity/post.entity';
import { Users } from '../../../Database/Entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, Users]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
