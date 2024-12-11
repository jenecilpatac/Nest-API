import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoryService } from '../category/category.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './storage/post-uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/jpg',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new HttpException(
              'Invalid image type, only jpeg, jpg, png, gif, ico, webp are allowed.',
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
    }),
  ],
  controllers: [PostController],
  providers: [PostService, CategoryService],
})
export class PostModule {}
