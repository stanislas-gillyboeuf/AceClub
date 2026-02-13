import * as AppleAuthentication from "expo-apple-authentication";
import { View } from "react-native";

type AppleButtonProps = {
  onSignIn?: (credential: AppleAuthentication.AppleAuthenticationCredential) => void;
  onError?: (error: Error) => void;
};

export default function AppleButton({ onSignIn, onError }: AppleButtonProps) {
  return (
    <View className="flex-row items-center justify-center">
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={{ width: "100%", height: 52 }}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            onSignIn?.(credential);
          } catch (e: any) {
            if (e.code !== "ERR_REQUEST_CANCELED") {
              onError?.(e);
            }
          }
        }}
      />
    </View>
  );
}
