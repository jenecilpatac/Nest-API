import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Content field is required' })
  content: string;

  @IsOptional()
  @IsBoolean()
  attachment?: boolean;
}
