import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { status as prismaStatus } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string): Promise<any[]> {
    return this.prisma.todos.findMany({
      where: {
        userId: userId,
        status: prismaStatus.pending,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });
  }

  create(createTodoDto: CreateTodoDto): Promise<any> {
    return this.prisma.todos.create({
      data: {
        userId: createTodoDto.userId,
        title: createTodoDto.title,
        content: createTodoDto.content,
        status: createTodoDto.status || prismaStatus.pending,
      },
    });
  }

  findById(id: number): Promise<any> {
    return this.prisma.todos.findUnique({
      where: { id },
    });
  }

  findByStatus(status: prismaStatus, userId: string): Promise<any> {
    return this.prisma.todos.findMany({
      where: {
        status,
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  update(
    id: number,
    updateTodoDto: CreateTodoDto,
    userId: string,
  ): Promise<any> {
    return this.prisma.todos.update({
      where: { id, userId },
      data: updateTodoDto,
    });
  }

  updateStatus(id: number, status: prismaStatus, userId: string): Promise<any> {
    return this.prisma.todos.update({
      where: { id, userId },
      data: { status },
    });
  }

  delete(id: number, userId: string): Promise<any> {
    return this.prisma.todos.delete({
      where: { id, userId },
    });
  }
}
