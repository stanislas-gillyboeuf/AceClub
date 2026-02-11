import { apiClient } from "../client";

export const uploadApi = {
  async getPresignedUrl(data: {
    filename: string;
    contentType: string;
  }): Promise<{ url: string; key: string }> {
    return apiClient
      .post("upload/presigned-url", { json: data })
      .json<{ url: string; key: string }>();
  },
};
