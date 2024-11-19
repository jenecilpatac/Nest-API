import { Module } from '@nestjs/common';
import { PostController } from '../../Controller/Blog/post.controller';
import { PostService } from '../../Service/Blog/post.service';
import { PrismaModule } from '../../Prisma/Module/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
