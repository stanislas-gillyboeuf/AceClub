export interface PublicKeyResponse {
  publicKey: string;
}

export interface KeyBackupResponse {
  encryptedPrivateKey: string;
  backupSalt: string;
}

export interface UploadKeysRequest {
  publicKey: string;
}

export interface UploadKeyBackupRequest {
  encryptedPrivateKey: string;
  backupSalt: string;
}
