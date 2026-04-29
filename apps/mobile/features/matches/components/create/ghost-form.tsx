import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { GlassView } from "@/components/ui/glass-view";
import { useCreateGhost } from "@/hooks/use-user";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { UserSearchItem } from "@/types/user";

interface GhostFormProps {
  initialName: string;
  onCreated: (user: UserSearchItem) => void;
  onBack: () => void;
  scheme: "light" | "dark";
}

export function GhostForm({ initialName, onCreated, onBack, scheme }: GhostFormProps) {
  const [ghostName, setGhostName] = useState(initialName);
  const [ghostEmail, setGhostEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createGhost = useCreateGhost();

  const canSubmit = ghostName.trim().length > 0 && ghostEmail.trim().includes("@");

  const handleSubmit = useCallback(() => {
    setError(null);
    createGhost.mutate(
      { name: ghostName.trim(), email: ghostEmail.trim() },
      {
        onSuccess: (ghost) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onCreated({
            id: ghost.id,
            name: ghost.name,
            image: ghost.image,
            isGhost: true,
          });
        },
        onError: (err: unknown) => {
          const status = (err as { status?: number })?.status;
          if (status === 409) {
            setError("Un joueur avec cet email existe déjà.");
          } else {
            setError("Erreur lors de la création. Réessayez.");
          }
        },
      },
    );
  }, [ghostName, ghostEmail, createGhost, onCreated]);

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
          Nom
        </Text>
        <GlassView style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { color: semanticColors.labelPrimary[scheme] }]}
            placeholder="Nom du joueur"
            placeholderTextColor={semanticColors.labelSecondary[scheme]}
            value={ghostName}
            onChangeText={setGhostName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </GlassView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: semanticColors.labelSecondary[scheme] }]}>
          Email
        </Text>
        <GlassView style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { color: semanticColors.labelPrimary[scheme] }]}
            placeholder="email@exemple.com"
            placeholderTextColor={semanticColors.labelSecondary[scheme]}
            value={ghostEmail}
            onChangeText={(text) => {
              setGhostEmail(text);
              if (error) setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </GlassView>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit || createGhost.isPending}
        style={({ pressed }) => [
          styles.submitButton,
          !canSubmit && styles.submitDisabled,
          pressed && canSubmit && { transform: [{ scale: 0.98 }] },
        ]}
      >
        {createGhost.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Ajouter</Text>
        )}
      </Pressable>

      <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
        <Text style={[styles.backText, { color: semanticColors.labelSecondary[scheme] }]}>
          Retour à la recherche
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  inputGroup: {
    width: "100%",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },
  inputWrapper: {
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    paddingVertical: 0,
  },
  error: {
    fontSize: 13,
    color: colors.red500,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: colors.accentGreen,
    borderRadius: radii.sm,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
  },
});
