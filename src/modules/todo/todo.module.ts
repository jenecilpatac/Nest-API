import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TodoGateway } from './todo.gateway';

@Module({
  imports: [PrismaModule],
  providers: [TodoService, TodoGateway],
  controllers: [TodoController],
})
export class TodoModule {}
