import { Hono } from "hono";
import type { HonoContext } from "../../types/hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth } from "../../middleware/auth";
import {
  sendMessageValidator,
  muteConversationValidator,
  findOrCreateConversationValidator,
  addReactionValidator,
  removeReactionValidator,
  createGroupValidator,
  pinMessageValidator,
  toggleAnnouncementsOnlyValidator,
  addGroupParticipantValidator,
  listClubGroupsValidator,
  archiveGroupValidator,
} from "./validators";
import {
  sendMessage,
  markRead,
  muteConversation,
  deleteConversation,
  deleteMessage,
  findOrCreateConversation,
  uploadAttachment,
  addReaction,
  removeReaction,
  acceptConversationRequest,
  rejectConversationRequest,
  createGroup,
  pinMessage,
  toggleAnnouncementsOnly,
  addGroupParticipant,
  removeGroupParticipant,
  archiveGroup,
} from "./mutations";
import { listConversations, getConversation, listMessages, listClubGroups } from "./queries";

export const conversationRouter = new Hono<HonoContext>();

// Apply auth middleware to all routes
conversationRouter.use("/*", requireAuth);

// List all conversations for the current user
conversationRouter.get("/", listConversations);

// Find or create a direct conversation with a participant
conversationRouter.post(
  "/find-or-create",
  zValidator("json", findOrCreateConversationValidator),
  findOrCreateConversation,
);

// Create a manual group (any club member)
conversationRouter.post("/create-group", zValidator("json", createGroupValidator), createGroup);

// Dashboard: list a club's groups (course-tied + manual), archive one
conversationRouter.get("/club-groups", zValidator("query", listClubGroupsValidator), listClubGroups);
conversationRouter.post(
  "/:id/archive",
  zValidator("json", archiveGroupValidator),
  archiveGroup,
);

// Accept or reject a pending conversation request
conversationRouter.post("/:id/accept-request", acceptConversationRequest);
conversationRouter.post("/:id/reject-request", rejectConversationRequest);

// Get a specific conversation
conversationRouter.get("/:id", getConversation);

// List messages in a conversation (paginated)
conversationRouter.get("/:id/messages", listMessages);

// Upload an attachment to a conversation
conversationRouter.post("/:id/upload-attachment", uploadAttachment);

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

// Delete (soft) a message (sender, or a group admin for any message)
conversationRouter.delete("/:id/message/:messageId", deleteMessage);

// Group moderation (admin-only, enforced in the handlers)
conversationRouter.post("/:id/pin-message", zValidator("json", pinMessageValidator), pinMessage);
conversationRouter.post(
  "/:id/announcements-only",
  zValidator("json", toggleAnnouncementsOnlyValidator),
  toggleAnnouncementsOnly,
);
conversationRouter.post(
  "/:id/add-participant",
  zValidator("json", addGroupParticipantValidator),
  addGroupParticipant,
);
conversationRouter.post(
  "/:id/remove-participant",
  zValidator("json", addGroupParticipantValidator),
  removeGroupParticipant,
);

// Add a reaction to a message
conversationRouter.post(
  "/:id/message/:messageId/reaction",
  zValidator("json", addReactionValidator),
  addReaction,
);

// Remove a reaction from a message
conversationRouter.delete(
  "/:id/message/:messageId/reaction",
  zValidator("json", removeReactionValidator),
  removeReaction,
);

// Delete (soft) a conversation for the current user
conversationRouter.delete("/:id", deleteConversation);
