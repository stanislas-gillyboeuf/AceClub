import { apiClient } from "../client";
import type { AuthSession } from "@/types/auth";

export const authApi = {
  async signInWithGoogle(idToken: string): Promise<AuthSession> {
    return apiClient
      .post("auth/sign-in/social", {
        json: {
          provider: "google",
          idToken: { token: idToken },
        },
      })
      .json<AuthSession>();
  },

  async signInWithApple(payload: {
    idToken: string;
    user?: { name?: { firstName?: string; lastName?: string } };
  }): Promise<AuthSession> {
    return apiClient
      .post("auth/sign-in/social", {
        json: {
          provider: "apple",
          idToken: { token: payload.idToken },
          ...(payload.user?.name && {
            name: `${payload.user.name.firstName ?? ""} ${payload.user.name.lastName ?? ""}`.trim(),
          }),
        },
      })
      .json<AuthSession>();
  },

  async signOut(): Promise<void> {
    await apiClient.post("auth/sign-out");
  },

  async getSession(): Promise<AuthSession | null> {
    try {
      return await apiClient.get("session").json<AuthSession>();
    } catch {
      return null;
    }
  },
};
