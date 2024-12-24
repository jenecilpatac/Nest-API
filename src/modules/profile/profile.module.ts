import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './storage/profile-picture-uploads',
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
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
