import { IsNotEmpty } from "class-validator";

// edit-message.dto.ts
export class EditMessageDto {
    @IsNotEmpty()
    content: {
      text: string;
      attachments?: string[];
    };
  }