import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

async function getAuthCookie(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync("mobile_cookie");
  } catch {
    return null;
  }
}

export const uploadService = {
  uploadUserImage: async (uri: string, fileName: string, mimeType: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    const headers: Record<string, string> = {};
    const cookie = await getAuthCookie();
    if (cookie) headers["Cookie"] = cookie;

    const response = await fetch(`${BASE_URL}/api/upload/user-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    return response.json() as Promise<{ url: string }>;
  },

  uploadOrgLogo: async (organizationId: string, uri: string, fileName: string, mimeType: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);
    formData.append("organizationId", organizationId);

    const headers: Record<string, string> = {};
    const cookie = await getAuthCookie();
    if (cookie) headers["Cookie"] = cookie;

    const response = await fetch(`${BASE_URL}/api/upload/org-logo`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    return response.json() as Promise<{ url: string }>;
  },
};
