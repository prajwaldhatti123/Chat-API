// create-message.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  content: {
    text?: string;
    attachments?: string[];
  };

  @IsString()
  @IsNotEmpty()
  type: 'text' | 'image' | 'file';
  
  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsArray()
  mentions?: string[];
}