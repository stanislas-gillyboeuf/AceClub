import { z } from "zod";

export const uploadKeysValidator = z.object({
  publicKey: z.string().min(1, "Public key is required"),
});

export const uploadKeyBackupValidator = z.object({
  encryptedPrivateKey: z.string().min(1, "Encrypted private key is required"),
  backupSalt: z.string().min(1, "Backup salt is required"),
});
