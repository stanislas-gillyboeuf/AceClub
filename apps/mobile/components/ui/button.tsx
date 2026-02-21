import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { colors } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantConfig = {
  primary: {
    tintColor: colors.accentGreen,
    text: "#FFFFFF",
    textDisabled: "rgba(255,255,255,0.5)",
    loader: "#FFFFFF",
  },
  secondary: {
    tintColor: undefined,
    text: colors.gray500,
    textDisabled: colors.gray400,
    loader: colors.gray500,
  },
  destructive: {
    tintColor: colors.red500,
    text: "#FFFFFF",
    textDisabled: "rgba(255,255,255,0.5)",
    loader: "#FFFFFF",
  },
} as const;

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const v = variantConfig[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        style,
      ]}
    >
      <GlassView
        style={[styles.glass, fullWidth && styles.fullWidth]}
        tintColor={v.tintColor}
      >
        {loading ? (
          <ActivityIndicator size="small" color={v.loader} />
        ) : (
          <Text
            style={[
              styles.label,
              { color: isDisabled ? v.textDisabled : v.text },
            ]}
          >
            {label}
          </Text>
        )}
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glass: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
