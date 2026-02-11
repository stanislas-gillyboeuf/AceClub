import { useState } from "react";
import { View, Text, SafeAreaView } from "@/tw";
import { Platform, Alert } from "react-native";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { Button } from "@/components/ui/Button";
import { useSignInWithGoogle, useSignInWithApple } from "@/hooks/useAuth";

GoogleSignin.configure({
  webClientId:
    "131274084335-lv3cs6n1eqajr5letmpgm57alipg51gb.apps.googleusercontent.com",
  iosClientId:
    "131274084335-lv3cs6n1eqajr5letmpgm57alipg51gb.apps.googleusercontent.com",
  scopes: ["email", "profile"],
});

export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const signInWithGoogle = useSignInWithGoogle();
  const signInWithApple = useSignInWithApple();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response) && response.data.idToken) {
        await signInWithGoogle.mutateAsync(response.data.idToken);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se connecter avec Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await signInWithApple.mutateAsync({
          idToken: credential.identityToken,
          user: {
            name: {
              firstName: credential.fullName?.givenName ?? undefined,
              lastName: credential.fullName?.familyName ?? undefined,
            },
          },
        });
      }
    } catch (error: any) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Erreur", "Impossible de se connecter avec Apple.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark">
      <View className="flex-1 justify-center items-center px-horizontal">
        <View className="items-center mb-16">
          <Text className="text-4xl font-sans-bold text-label-primary dark:text-label-primary-dark">
            AceClub
          </Text>
          <Text className="text-lg font-sans text-label-secondary mt-2">
            Tennis & Padel
          </Text>
        </View>

        <View className="w-full gap-3">
          <Button
            variant="outlined"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {signInWithGoogle.isPending
              ? "Connexion..."
              : "Continuer avec Google"}
          </Button>

          {Platform.OS === "ios" && (
            <Button
              variant="primary"
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              {signInWithApple.isPending
                ? "Connexion..."
                : "Continuer avec Apple"}
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
