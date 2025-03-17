import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ 
    type: String, 
    required: true,
    unique: true 
  })
  messageId: string; // msg_001

  @Prop({ 
    type: String, 
    ref: 'Conversation',
    required: true 
  })
  conversation: string;

  @Prop({ 
    type: String, 
    ref: 'UserProfile',
    required: true 
  })
  sender: string;

  @Prop({
    text: { type: String, required: false },
    attachments: [{ type: String }]
  })
  content: {
    text?: string;
    attachments?: string[];
  };

  @Prop({ 
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    required: true 
  })
  type: string;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop([{
    content: {
      text: String,
      attachments: [String]
    },
    timestamp: Date
  }])
  editHistory: Array<{
    content: {
      text?: string;
      attachments?: string[];
    };
    timestamp: Date;
  }>;

  @Prop({ 
    type: String, 
    ref: 'Message' 
  })
  replyTo?: string;

  @Prop([{ 
    type: String, 
    ref: 'UserProfile' 
  }])
  mentions: string[];

  @Prop([{
    user: { 
      type: String, 
      ref: 'UserProfile',
      required: true 
    },
    reaction: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }])
  reactions: Array<{
    user: string;
    reaction: string;
    timestamp: Date;
  }>;

  @Prop({
    deliveredTo: [{ 
      type: String, 
      ref: 'UserProfile' 
    }],
    readBy: [{ 
      type: String, 
      ref: 'UserProfile' 
    }]
  })
  status: {
    deliveredTo: string[];
    readBy: string[];
  };

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: false })
  ephemeral: boolean;

  @Prop()
  expiresAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for critical operations
MessageSchema.index({ conversation: 1, createdAt: -1 }); // Pagination
MessageSchema.index({ sender: 1, createdAt: -1 }); // User message history
MessageSchema.index({ 'content.text': 'text' }); // Search messages