import { IsString, IsNotEmpty, Validate } from 'class-validator';
import { IsUnique } from '../../../common/pipes/unique.validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @Validate(IsUnique, ['categories', 'categoryName'], {
    message: 'Category Name already taken',
  })
  categoryName: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  slug?: string;
}
