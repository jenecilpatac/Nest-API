import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { useContainer } from 'class-validator';
import * as passport from 'passport';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as path from 'path';
import * as express from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   AppModule,
  //   new FastifyAdapter(),
  // );

  app.use(
    session({
      secret: process.env.JWT_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(helmet());

  app.use(cookieParser());

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
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');
  app.use('/', express.static(path.join(__dirname, '..')));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
