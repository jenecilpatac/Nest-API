import { status } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Title field is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content field is required' })
  content: string;

  @IsEnum(status)
  @IsOptional()
  status: status = status.pending;
}
