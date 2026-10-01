import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { authClient } from "@/lib/auth-client";
import { onboardingColors } from "@/features/onboarding/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface EmailAuthFormProps {
  mode: "sign-in" | "sign-up";
  /** Called after a successful sign-up only — sign-in still relies on the (auth) layout's
   * reactive redirect, nothing extra to do there. Used to trigger email verification. */
  onSignUpSuccess?: (email: string) => void;
}

export function EmailAuthForm({ mode, onSignUpSuccess }: EmailAuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (mode === "sign-up" && !trimmedName) {
      setError("Merci d'indiquer ton nom");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Adresse email invalide");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res =
        mode === "sign-in"
          ? await authClient.signIn.email({ email: trimmedEmail, password })
          : await authClient.signUp.email({
              email: trimmedEmail,
              password,
              name: trimmedName,
            });
      if (res.error) {
        setError(
          res.error.message ??
            (mode === "sign-in"
              ? "Email ou mot de passe incorrect"
              : "Impossible de créer le compte"),
        );
        return;
      }
      if (mode === "sign-up") {
        onSignUpSuccess?.(trimmedEmail);
      }
      // Sign-in success: the (auth) layout redirects automatically once the session updates —
      // no manual navigation needed here.
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {mode === "sign-up" && (
        <TextInput
          style={styles.input}
          placeholder="Nom"
          placeholderTextColor={onboardingColors.fgDim}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={onboardingColors.fgDim}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={onboardingColors.fgDim}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === "sign-in" ? "password" : "new-password"}
      />

      <Pressable
        onPress={handleSubmit}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
          isLoading && styles.submitButtonDisabled,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={onboardingColors.accentForeground} />
        ) : (
          <Text style={styles.submitButtonText}>
            {mode === "sign-in" ? "Se connecter" : "Continuer"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 10,
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: onboardingColors.fg,
    fontSize: 13,
    textAlign: "center",
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
    paddingHorizontal: 16,
    fontSize: 15,
    color: onboardingColors.fg,
    backgroundColor: onboardingColors.cardBg,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: onboardingColors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: onboardingColors.accentForeground,
  },
});
