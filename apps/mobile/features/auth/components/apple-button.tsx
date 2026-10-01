import * as AppleAuthentication from "expo-apple-authentication";
import { View, Platform } from "react-native";

type AppleButtonProps = {
  onSignIn?: (credential: AppleAuthentication.AppleAuthenticationCredential) => void;
  onError?: (error: Error) => void;
  cornerRadius?: number;
  height?: number;
  buttonStyle?: AppleAuthentication.AppleAuthenticationButtonStyle;
  disabled?: boolean;
};

export default function AppleButton({
  onSignIn,
  onError,
  cornerRadius = 8,
  height = 52,
  buttonStyle = AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
  disabled = false,
}: AppleButtonProps) {
  if (Platform.OS !== "ios") return null;

  return (
    <View className="flex-row items-center justify-center">
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={buttonStyle}
        cornerRadius={cornerRadius}
        style={{ width: "100%", height, opacity: disabled ? 0.6 : 1 }}
        onPress={async () => {
          if (disabled) return;
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
