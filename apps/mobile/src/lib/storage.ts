import * as SecureStore from "expo-secure-store";

const KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_ID: "user_id",
} as const;

export const storage = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  },

  async removeRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER_ID),
    ]);
  },
};
