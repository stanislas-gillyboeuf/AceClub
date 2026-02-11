import { apiClient } from "../client";
import type {
  Conversation,
  Message,
  FindOrCreateResult,
} from "@/types/conversation";

export const conversationApi = {
  /** GET /conversation — list all conversations for current user */
  async list(): Promise<Conversation[]> {
    return apiClient.get("conversation").json<Conversation[]>();
  },

  /** GET /conversation/:id — get a specific conversation */
  async get(id: string): Promise<Conversation> {
    return apiClient.get(`conversation/${id}`).json<Conversation>();
  },

  /** GET /conversation/:id/messages?before=<ISO>&limit=<n> — paginated messages */
  async getMessages(
    conversationId: string,
    params?: { before?: string; limit?: number }
  ): Promise<Message[]> {
    const searchParams: Record<string, string> = {};
    if (params?.before) searchParams.before = params.before;
    if (params?.limit != null) searchParams.limit = String(params.limit);

    return apiClient
      .get(`conversation/${conversationId}/messages`, { searchParams })
      .json<Message[]>();
  },

  /** POST /conversation/:id/message — send a message */
  async sendMessage(
    conversationId: string,
    content: string,
    clientMessageId?: string
  ): Promise<Message> {
    return apiClient
      .post(`conversation/${conversationId}/message`, {
        json: { content, clientMessageId },
      })
      .json<Message>();
  },

  /** POST /conversation/find-or-create — find or create a direct conversation */
  async findOrCreate(participantId: string): Promise<FindOrCreateResult> {
    return apiClient
      .post("conversation/find-or-create", {
        json: { participantId },
      })
      .json<FindOrCreateResult>();
  },

  /** POST /conversation/:id/mark-read */
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`conversation/${conversationId}/mark-read`);
  },

  /** POST /conversation/:id/mute */
  async mute(conversationId: string, isMuted: boolean): Promise<void> {
    await apiClient.post(`conversation/${conversationId}/mute`, {
      json: { isMuted },
    });
  },

  /** DELETE /conversation/:id — soft delete */
  async delete(conversationId: string): Promise<void> {
    await apiClient.delete(`conversation/${conversationId}`);
  },

  /** DELETE /conversation/:id/message/:messageId — delete a message */
  async deleteMessage(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    await apiClient.delete(
      `conversation/${conversationId}/message/${messageId}`
    );
  },
};
