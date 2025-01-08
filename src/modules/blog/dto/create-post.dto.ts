import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { IsExists } from '../../../common/pipes/is-exists';
import { privacy } from '@prisma/client';

export class CreatePostDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image: string[] | null;

  @IsOptional()
  @IsEnum(privacy, { message: 'Invalid privacy selection' })
  publishedAs: privacy;

  @IsString()
  @IsNotEmpty({ message: 'Description field is required' })
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Please select category first' })
  @IsExists('categories', 'id', { message: 'Category does not exist' })
  categoryId?: number;
}
