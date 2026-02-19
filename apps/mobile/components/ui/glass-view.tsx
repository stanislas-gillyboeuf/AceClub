import { Platform, View } from "react-native";
import { GlassView as ExpoGlassView } from "expo-glass-effect";
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
  if (Platform.OS === "ios") {
    return <ExpoGlassView style={style} tintColor={tintColor} {...rest} />;
  }

  return (
    <AndroidGlassFallback style={style} tintColor={tintColor} {...rest} />
  );
}

function AndroidGlassFallback({
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
          backgroundColor: tintColor ? `${tintColor}18` : bg,
          borderWidth: 1,
          borderColor: tintColor ? `${tintColor}30` : border,
        },
        style,
      ]}
      {...rest}
    />
  );
}
