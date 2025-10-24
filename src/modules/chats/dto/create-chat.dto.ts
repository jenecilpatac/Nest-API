import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
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
