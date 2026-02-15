import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { e2eeManager } from "@/lib/e2ee-manager";
import { e2eeService } from "@/services/e2ee";

export function useE2EEBackup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const backup = useCallback(async (passphrase: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await e2eeManager.initialize();
      const { encryptedKey, salt } = await e2eeManager.encryptPrivateKeyWithPassphrase(passphrase);
      await e2eeService.uploadKeyBackup({
        encryptedPrivateKey: encryptedKey,
        backupSalt: salt,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de la sauvegarde de la clé");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { backup, isLoading, error, success, resetSuccess: () => setSuccess(false) };
}

export function useE2EERecovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const recover = useCallback(async (passphrase: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const backupData = await e2eeService.getKeyBackup();
      await e2eeManager.restorePrivateKeyFromBackup(
        backupData.encryptedPrivateKey,
        backupData.backupSalt,
        passphrase
      );
      setSuccess(true);
    } catch (e: any) {
      setError("La récupération a échoué. Vérifiez votre phrase de passe.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { recover, isLoading, error, success, resetSuccess: () => setSuccess(false) };
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { api } = await import("@/lib/api");
      return api.delete<void>("/user/me");
    },
  });
}
