import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { useContainer } from 'class-validator';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formattedErrors = {};
        errors.forEach((err) => {
          formattedErrors[err.property] = {
            message: err.constraints[Object.keys(err.constraints)[0]],
          };
        });
        return new BadRequestException(formattedErrors);
      },
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
