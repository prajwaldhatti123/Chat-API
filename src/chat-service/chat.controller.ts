import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserProfile } from 'src/auth/models/user.model';
import { GetUser } from 'src/auth/Decorators/get-user.decorator';
import { EditMessageDto } from './dto/edit-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit = 50,
    @Query('cursor') cursor?: string,
  ) {
    const messages = await this.chatService.getConversationMessages(
      conversationId,
      Number(limit),
      cursor,
    );

    return {
      data: messages,
      pagination: {
        limit: Number(limit),
        nextCursor: messages.length ? messages[messages.length - 1]._id : null,
        hasMore: messages.length === Number(limit),
      },
    };
  }

  @Post(':conversationId/messages')
  async createMessage(
    @Param('conversationId') conversationId: string,
    @GetUser() user: UserProfile,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(
      conversationId,
      user._id,
      createMessageDto,
    );
  }

  @Get()
  async getConversations(@GetUser() user: UserProfile) {
    return this.chatService.getConversations(user._id);
  }

  @Post(':conversationId/messages/:messageId/read')
  async markMessageAsRead(
    @Param('messageId') messageId: string,
    @GetUser() user: UserProfile,
  ) {
    return this.chatService.markAsRead(messageId, user._id);
  }

  @Post(':conversationId/messages/:messageId/reactions')
  async addReaction(
    @Param('messageId') messageId: string,
    @GetUser() user: UserProfile,
    @Body('reaction') reaction: string,
  ) {
    return this.chatService.addReaction(messageId, user._id, reaction);
  }

  @Patch('messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @GetUser() user: UserProfile,
    @Body() editMessageDto: EditMessageDto,
  ) {
    return this.chatService.editMessage(messageId, user._id, editMessageDto);
  }

  @Delete('messages/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @GetUser() user: UserProfile,
  ) {
    return this.chatService.deleteMessage(messageId, user._id);
  }

  // chat.controller.ts
  @Post()
  async createConversation(
    @GetUser() user: UserProfile,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user._id, createConversationDto);
  }
}
