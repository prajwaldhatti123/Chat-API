import { MessageDto } from "./message.dto";

// conversation.dto.ts
export class ConversationDto {
    conversationId: string;
    chatType: 'direct' | 'group';
    groupInfo?: {
      name: string;
      description?: string;
      admins: string[];
      createdAt: Date;
    };
    participants: Array<{
      userId: string;
      role?: string;
      lastSeen?: Date;
    }>;
    lastMessage?: MessageDto;
    unreadCounts: Record<string, number>;
  }