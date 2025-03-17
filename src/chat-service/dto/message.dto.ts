// message.dto.ts
export class MessageDto {
    id: string;
    senderId: string;
    content: {
      text?: string;
      attachments?: string[];
    };
    timestamp: Date;
    type: string;
    reactions: Array<{
      userId: string;
      reaction: string;
      timestamp: Date;
    }>;
    status: {
      deliveredTo: string[];
      readBy: string[];
    };
    isEdited: boolean;
    replyTo?: string;
    mentions: string[];
  }