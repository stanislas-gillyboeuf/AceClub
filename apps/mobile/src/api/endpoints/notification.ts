import { apiClient } from "../client";

export const notificationApi = {
  async registerToken(data: {
    token: string;
    platform: "ios" | "android";
  }): Promise<void> {
    await apiClient.post("notification/register-token", { json: data });
  },

  async unregisterToken(token: string): Promise<void> {
    await apiClient.post("notification/unregister-token", {
      json: { token },
    });
  },
};
