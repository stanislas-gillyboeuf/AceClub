import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import { sendMessageValidator, muteConversationValidator } from "./validators";
import { sendMessage, markRead, muteConversation, deleteConversation } from "./mutations";
import { listConversations, getConversation, listMessages } from "./queries";

export const conversationRouter = new Hono<HonoContext>();

// Apply auth middleware to all routes
conversationRouter.use("/*", requireAuth);

// List all conversations for the current user
conversationRouter.get("/", listConversations);

// Get a specific conversation
conversationRouter.get("/:id", getConversation);

// List messages in a conversation (paginated)
conversationRouter.get("/:id/messages", listMessages);

// Send a message to a conversation
conversationRouter.post("/:id/message", zValidator("json", sendMessageValidator), sendMessage);

// Mark conversation as read
conversationRouter.post("/:id/mark-read", markRead);

// Mute/unmute a conversation
conversationRouter.post(
  "/:id/mute",
  zValidator("json", muteConversationValidator),
  muteConversation,
);

// Delete (soft) a conversation for the current user
conversationRouter.delete("/:id", deleteConversation);
