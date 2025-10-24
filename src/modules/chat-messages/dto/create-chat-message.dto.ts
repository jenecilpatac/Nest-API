import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  attachment?: boolean;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
