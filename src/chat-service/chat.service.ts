import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { Conversation } from './models/conversation.schema';
import { Message } from './models/message.schema';
import { EditMessageDto } from './dto/edit-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async getConversationMessages(
    conversationId: string,
    limit: number,
    cursor?: string,
  ) {
    const query: any = { conversation: conversationId };

    if (cursor) {
      query['_id'] = { $lt: cursor };
    }

    return this.messageModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .populate('sender', 'userId username avatarUrl')
      .exec();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ) {
    const message = new this.messageModel({
      ...createMessageDto,
      conversation: conversationId,
      sender: senderId,
      status: {
        deliveredTo: [],
        readBy: [],
      },
    });

    const savedMessage = await message.save();

    // Update conversation's last message and unread counts
    await this.conversationModel.updateOne(
      { conversationId },
      {
        $set: { lastMessage: savedMessage._id },
        $inc: {
          'unreadCounts.$[elem]': 1,
        },
      },
      {
        arrayFilters: [{ elem: { $ne: senderId } }],
      },
    );

    return savedMessage;
  }

  async getConversations(userId: string) {
    return this.conversationModel
      .find({ 'participants.user': userId })
      .populate({
        path: 'lastMessage',
        select: 'content sender timestamp',
      })
      .populate({
        path: 'participants.user',
        select: 'userId username avatarUrl status',
      })
      .exec();
  }

  async markAsRead(messageId: string, userId: string) {
    return this.messageModel.updateOne(
      { _id: messageId },
      {
        $addToSet: { 'status.readBy': userId },
        $pull: { 'status.deliveredTo': userId },
      },
    );
  }

  async addReaction(messageId: string, userId: string, reaction: string) {
    return this.messageModel.updateOne(
      { _id: messageId },
      {
        $push: {
          reactions: {
            user: userId,
            reaction,
            timestamp: new Date(),
          },
        },
      },
    );
  }

  // chat.service.ts
  async deleteMessage(messageId: string, userId: string) {
    // Check ownership or admin status
    const message = await this.messageModel.findOne({
      _id: messageId,
      $or: [
        { sender: userId },
        {
          conversation: {
            $in: await this.conversationModel.find({
              'participants.user': userId,
              'participants.role': 'admin',
            }),
          },
        },
      ],
    });

    if (!message) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    // Remove from pinned messages
    await this.conversationModel.updateMany(
      { pinnedMessages: messageId },
      { $pull: { pinnedMessages: messageId } },
    );

    // Soft delete (or hard delete)
    return this.messageModel.findByIdAndDelete(messageId);
  }

  async editMessage(messageId: string, userId: string, dto: EditMessageDto) {
    const message = await this.messageModel.findOne({
      _id: messageId,
      sender: userId,
    });

    if (!message) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    // Preserve edit history
    message.editHistory.push({
      content: message.content,
      timestamp: new Date(),
    });

    // Update content
    message.content = dto.content;
    message.isEdited = true;

    return message.save();
  }

  // chat.service.ts
  async createConversation(creatorId: string, dto: CreateConversationDto) {
    // For direct chats, check if conversation already exists
    if (dto.chatType === 'direct') {
      const existing = await this.conversationModel.findOne({
        chatType: 'direct',
        participants: {
          $all: dto.participants,
          $size: 2,
        },
      });

      if (existing) {
        return existing; // Return existing conversation
      }
    }

    // Build conversation document
    const conversation = new this.conversationModel({
      conversationId: `conv_${Date.now()}`, // Generate unique ID
      chatType: dto.chatType,
      participants: dto.participants.map((userId) => ({
        user: userId,
        role:
          userId === creatorId && dto.chatType === 'group' ? 'admin' : 'member',
      })),
      groupInfo:
        dto.chatType === 'group'
          ? {
              name: dto.groupInfo.name,
              description: dto.groupInfo.description,
              admins: [creatorId],
              createdAt: new Date(),
            }
          : undefined,
      unreadCounts: new Map(
        dto.participants.filter((id) => id !== creatorId).map((id) => [id, 0]),
      ),
    });

    return conversation.save();
  }
}
