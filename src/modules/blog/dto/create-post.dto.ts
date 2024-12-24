import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { IsExists } from '../../../common/pipes/is-exists';

export class CreatePostDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image: string[] | null;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Please select category first' })
  @IsExists('categories', 'id', { message: 'Category does not exist' })
  categoryId?: number;
}
