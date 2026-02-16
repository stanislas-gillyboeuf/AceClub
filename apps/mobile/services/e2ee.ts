import { api } from "@/lib/api";
import type { PublicKeyResponse, KeyBackupResponse, UploadKeysRequest, UploadKeyBackupRequest } from "@/types/e2ee";

export const e2eeService = {
  getPublicKey: (userId: string) =>
    api.get<PublicKeyResponse>(`/e2ee/public-key/${userId}`),

  getKeyBackup: () =>
    api.get<KeyBackupResponse>("/e2ee/key-backup"),

  uploadPublicKey: (data: UploadKeysRequest) =>
    api.post<void>("/e2ee/keys", data),

  uploadKeyBackup: (data: UploadKeyBackupRequest) =>
    api.post<void>("/e2ee/key-backup", data),
};
