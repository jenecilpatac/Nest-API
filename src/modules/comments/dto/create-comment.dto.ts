import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment must be at least 1 character' })
  @IsNotEmpty({ message: 'Comment field is required' })
  comment: string;
}
