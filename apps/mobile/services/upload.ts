import { api } from "@/lib/api";

export const uploadService = {
  uploadUserImage: (
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<{ imageUrl: string }> =>
    api.uploadMultipart<{ imageUrl: string }>(
      "/upload/user-image",
      "image",
      uri,
      fileName,
      mimeType
    ),

  uploadOrgLogo: (
    organizationId: string,
    uri: string,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string }> =>
    api.uploadMultipart<{ url: string }>(
      "/upload/org-logo",
      "file",
      uri,
      fileName,
      mimeType,
      { organizationId }
    ),
};
