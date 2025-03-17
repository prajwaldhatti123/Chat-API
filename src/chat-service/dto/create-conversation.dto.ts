// create-conversation.dto.ts
import { 
    IsArray, 
    IsEnum, 
    IsNotEmpty, 
    IsOptional, 
    ValidateNested, 
    ValidateIf, 
    ArrayNotEmpty,
    ArrayMinSize,
    ArrayMaxSize
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class GroupInfoDto {
    @IsNotEmpty()
    name: string;
  
    @IsOptional()
    description?: string;
  }
  
  export class CreateConversationDto {
    @IsNotEmpty()
    @IsEnum(['direct', 'group'])
    chatType: 'direct' | 'group';
  
    @IsOptional()
    @ValidateIf(o => o.chatType === 'group')
    @ValidateNested()
    @Type(() => GroupInfoDto)
    groupInfo?: GroupInfoDto;
  
    @IsArray()
    @ArrayNotEmpty()
    @ValidateIf(o => o.chatType === 'direct', {
      message: 'Direct chat requires exactly 2 participants'
    })
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @ValidateIf(o => o.chatType === 'group', {
      message: 'Group requires at least 2 participants'
    })
    @ArrayMinSize(2)
    participants: string[];
  }