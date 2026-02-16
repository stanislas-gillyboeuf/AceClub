import { api, ApiError, getAuthHeaders, BASE_URL } from "@/lib/api";

export const uploadService = {
  uploadUserImage: async (
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<{ imageUrl: string }> => {
    return api.uploadMultipart<{ imageUrl: string }>(
      "/upload/user-image",
      "image",
      uri,
      fileName,
      mimeType
    );
  },

  uploadOrgLogo: async (
    organizationId: string,
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
    formData.append("organizationId", organizationId);

    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/upload/org-logo`, {
      method: "POST",
      credentials: "omit",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(response.status, text);
    }

    return response.json();
  },
};
