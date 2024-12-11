import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { status as prismaStatus } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async findAll(@AuthUser() user): Promise<any> {
    const todos = await this.todoService.findAll(user.id);

    if (todos.length === 0) {
      return {
        statusCode: 404,
        message: 'You have no todos at this moment. You can create one',
        todos: todos,
      };
    }

    return {
      statusCode: 200,
      message: 'Todos fetched successfully',
      todos: todos,
    };
  }

  @Post('create-todos')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
    @AuthUser() user,
  ): Promise<any> {
    const todo = await this.todoService.create({
      ...createTodoDto,
      userId: user.id,
      status: createTodoDto.status || prismaStatus.pending,
    });

    return {
      statusCode: 201,
      message: 'Todo created successfully',
      todo,
    };
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async findTodoById(@Param('id') id: number, @AuthUser() user): Promise<any> {
    const todo = await this.todoService.findById(id);
    if (!todo) {
      return {
        statusCode: 404,
        message: 'No todo found on this id',
        todo,
      };
    }

    if (todo.userId !== user.id) {
      return {
        statusCode: 401,
        message: 'Fetching failed. You are not the owner of this todo',
      };
    }

    return {
      statusCode: 200,
      message: 'Todo fetched successfully',
      todo,
    };
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async findTodoByStatus(
    @Param('status') status: prismaStatus,
    @AuthUser() user,
  ): Promise<any> {
    if (
      status !== prismaStatus.pending &&
      status !== prismaStatus.done &&
      status !== prismaStatus.ongoing &&
      status !== prismaStatus.cancelled
    ) {
      {
        return {
          statusCode: 400,
          message: `Invalid status value ${status}`,
        };
      }
    }
    const todo = await this.todoService.findByStatus(status, user.id);
    if (todo.length === 0) {
      return {
        statusCode: 404,
        message: `No todo found on this ${status} status`,
      };
    }

    return {
      statusCode: 200,
      message: 'Todo fetched successfully',
      todo,
    };
  }

  @Post('update-todos/:id')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async updateTodo(
    @Param('id') id: number,
    @Body() updateTodoDto: CreateTodoDto,
    @AuthUser() user,
  ): Promise<any> {
    const todo = await this.todoService.findById(id);
    if (!todo) {
      return {
        statusCode: 404,
        message: 'No todo found on this id',
      };
    }

    if (todo.userId !== user.id) {
      return {
        statusCode: 401,
        message: 'Updating failed. You are not the owner of this todo',
      };
    }

    const todoUpdated = await this.todoService.update(
      id,
      updateTodoDto,
      user.id,
    );
    if (todoUpdated) {
      return {
        statusCode: 200,
        message: 'Todo updated successfully',
      };
    }
  }

  @Delete('delete-todos/:id')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async deleteTodo(@Param('id') id: number, @AuthUser() user): Promise<any> {
    const todo = await this.todoService.findById(id);

    if (!todo) {
      return {
        statusCode: 404,
        message: 'No todo found on this id or already deleted',
      };
    }

    if (todo.userId !== user.id) {
      return {
        statusCode: 401,
        message: `Deletion failed. You are not the owner of this todo`,
      };
    }

    const deletedTodo = await this.todoService.delete(id, user.id);
    if (deletedTodo) {
      return {
        statusCode: 200,
        message: 'Todo deleted successfully',
      };
    }
  }

  @Post('change-status/:id')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async changeTodoStatus(
    @Param('id') id: number,
    @Body() req,
    @AuthUser() user,
  ): Promise<any> {
    const todo = await this.todoService.findById(id);
    if (!todo) {
      return {
        statusCode: 404,
        message: 'No todo found on this id',
      };
    }
    if (todo.userId !== user.id) {
      return {
        statusCode: 401,
        message: 'Updating failed. You are not the owner of this todo',
      };
    }

    if (
      req.status !== prismaStatus.pending &&
      req.status !== prismaStatus.done &&
      req.status !== prismaStatus.ongoing &&
      req.status !== prismaStatus.cancelled
    ) {
      return {
        statusCode: 400,
        message: `Invalid status value ${req.status}`,
      };
    }

    const todoUpdated = await this.todoService.updateStatus(
      id,
      req.status,
      user.id,
    );

    if (todoUpdated) {
      return {
        statusCode: 200,
        message: `Todo status updated successfully to ${req.status}`,
      };
    }
  }
}
