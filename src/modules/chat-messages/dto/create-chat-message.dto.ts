import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  attachment?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
