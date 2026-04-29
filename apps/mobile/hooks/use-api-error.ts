import { useCallback } from "react";
import { Alert } from "react-native";
import { ApiError } from "@/lib/api";
import { logger } from "@/lib/logger";

function statusMessage(status: number): string | null {
  if (status === 401) return "Ta session a expiré. Reconnecte-toi.";
  if (status === 403) return "Tu n'as pas les permissions pour cette action.";
  if (status === 404) return "Ressource introuvable.";
  if (status === 409) return "Conflit détecté. Vérifie l'état actuel.";
  if (status === 429) return "Trop de requêtes. Réessaie dans un instant.";
  if (status >= 500) return "Erreur serveur. Réessaie plus tard.";
  return null;
}

export function useApiError() {
  return useCallback((error: unknown, fallbackMessage?: string): void => {
    logger.error("[useApiError]", error);

    if (error instanceof ApiError) {
      const fromStatus = statusMessage(error.status);
      const message = fromStatus ?? fallbackMessage ?? error.message ?? "Une erreur est survenue.";
      Alert.alert("Erreur", message);
      return;
    }

    if (error instanceof Error) {
      Alert.alert("Erreur", fallbackMessage ?? error.message ?? "Une erreur est survenue.");
      return;
    }

    Alert.alert("Erreur", fallbackMessage ?? "Une erreur est survenue.");
  }, []);
}
