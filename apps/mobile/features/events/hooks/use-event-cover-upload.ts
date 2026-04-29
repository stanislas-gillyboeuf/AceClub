import { uploadService } from "@/services/upload";

export async function uploadEventCover(localUri: string): Promise<string> {
  if (!localUri) return localUri;
  if (/^https?:\/\//.test(localUri)) return localUri;

  const fileName = `event_cover_${Date.now()}.jpg`;
  const result = await uploadService.uploadUserImage(localUri, fileName, "image/jpeg");
  return result.imageUrl;
}
