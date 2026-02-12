import { z } from "zod";

export const sendMessageValidator = z.object({
  content: z.string().min(1).max(4000),
  clientMessageId: z.string().optional(),
  isEncrypted: z.boolean().optional().default(false),
});

export const listMessagesValidator = z.object({
  before: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const muteConversationValidator = z.object({
  isMuted: z.boolean(),
});

export const findOrCreateConversationValidator = z.object({
  participantId: z.string().min(1),
});
