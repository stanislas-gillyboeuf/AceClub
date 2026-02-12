import { z } from "zod";

export const sendMessageValidator = z.object({
  content: z.string().max(4000).default(""),
  clientMessageId: z.string().optional(),
  isEncrypted: z.boolean().optional().default(false),
  type: z.enum(["text", "voice", "image"]).optional().default("text"),
  attachmentUrl: z.string().optional(),
  attachmentDuration: z.number().int().optional(),
  attachmentWidth: z.number().int().optional(),
  attachmentHeight: z.number().int().optional(),
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
