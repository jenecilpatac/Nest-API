import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  attachment?: string;
}
