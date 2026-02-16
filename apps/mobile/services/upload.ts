import { getAuthCookie, BASE_URL } from "@/lib/api";

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
