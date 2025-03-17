import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ 
    type: String, 
    required: true,
    unique: true 
  })
  conversationId: string; // conv_001

  @Prop({ 
    type: String,
    enum: ['direct', 'group'],
    required: true 
  })
  chatType: string;

  // Only for group chats
  @Prop({
    _id: false,
    type: {
      name: String,
      description: String,
      admins: [{ type: String, ref: 'UserProfile' }],
      createdAt: Date
    },
    required: function() {
      return this.chatType === 'group';
    }
  })
  groupInfo?: {
    name: string;
    description?: string;
    admins: string[];
    createdAt: Date;
  };

  // Common for all chat types
  @Prop([{
    user: { 
      type: String, 
      ref: 'UserProfile',
      required: true 
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    lastSeen: Date
  }])
  participants: Array<{
    user: string;
    role?: string;
    lastSeen?: Date;
  }>;

  @Prop({ 
    type: String,
    ref: 'Message' 
  })
  lastMessage?: string;

  @Prop({
    type: Map,
    of: Number,
    default: {}
  })
  unreadCounts: Map<string, number>; // <userId, count>

  @Prop([{ 
    type: String, 
    ref: 'Message' 
  }])
  pinnedMessages: string[];

  @Prop({
    muteNotifications: { type: Boolean, default: false },
    theme: { type: String, default: 'dark' }
  })
  settings: {
    muteNotifications: boolean;
    theme: string;
  };

  // Virtual for API response format
  public get metadata() {
    return {
      unreadCount: Object.fromEntries(this.unreadCounts),
      pinnedMessages: this.pinnedMessages,
      conversationSettings: this.settings
    };
  }
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes
ConversationSchema.index({ participants: 1 }); // Find user's conversations
ConversationSchema.index({ 'groupInfo.admins': 1 }); // Admin operations