import { IsString, IsNotEmpty, Validate } from 'class-validator';
import { IsUnique } from '../../../common/pipes/unique.validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name field is required' })
  @Validate(IsUnique, ['categories', 'categoryName'], {
    message: 'Category Name already taken',
  })
  categoryName: string;

  @IsString()
  @IsNotEmpty({ message: 'Description field is required' })
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug field is required' })
  slug?: string;
}
