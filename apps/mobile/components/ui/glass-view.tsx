import { Platform, View } from "react-native";
import {
  GlassView as ExpoGlassView,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import type { GlassViewProps } from "expo-glass-effect";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

/**
 * Cross-platform GlassView wrapper.
 * - iOS: renders the native Liquid Glass effect via expo-glass-effect.
 * - Android: renders a styled View with card background + subtle border
 *   to avoid the transparent fallback.
 */
export function GlassView({ style, tintColor, ...rest }: GlassViewProps) {
  if (Platform.OS === "ios" && isGlassEffectAPIAvailable()) {
    return <ExpoGlassView style={style} tintColor={tintColor} {...rest} />;
  }

  return <GlassFallback style={style} tintColor={tintColor} {...rest} />;
}

function GlassFallback({
  style,
  tintColor,
  glassEffectStyle: _ges,
  isInteractive: _ii,
  colorScheme: _cs,
  ...rest
}: GlassViewProps) {
  const scheme = useColorScheme();
  const bg = semanticColors.cardBackground[scheme];
  const border = semanticColors.borderColor[scheme];

  return (
    <View
      style={[
        {
          backgroundColor: tintColor ?? bg,
          borderWidth: tintColor ? 0 : 1,
          borderColor: tintColor ? undefined : border,
        },
        style,
      ]}
      {...rest}
    />
  );
}
