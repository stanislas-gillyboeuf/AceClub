import { Platform, View, StyleSheet } from "react-native";
import { GoogleSignin, GoogleSigninButton } from "@/lib/google-signin";

type GoogleButtonProps = {
  onSignIn?: (idToken: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
};

/** Official Google-branded button — size/color are constrained to the SDK's own enums, no
 * arbitrary hex fill or custom height (Google's branding guidelines, same constraint as
 * Apple's AppleAuthenticationButton in apple-button.tsx). */
export default function GoogleButton({ onSignIn, onError, disabled = false }: GoogleButtonProps) {
  if (Platform.OS !== "ios" || !GoogleSigninButton) return null;

  const handlePress = async () => {
    if (disabled) return;
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) {
        onError?.(new Error("Impossible de récupérer le token Google"));
        return;
      }
      onSignIn?.(idToken);
    } catch (e: any) {
      if (e?.code !== "SIGN_IN_CANCELLED") {
        onError?.(e instanceof Error ? e : new Error(e?.message ?? "Une erreur est survenue avec Google Sign-In"));
      }
    }
  };

  return (
    <View style={[styles.wrapper, disabled && styles.disabled]}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        style={styles.button}
        onPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
});
