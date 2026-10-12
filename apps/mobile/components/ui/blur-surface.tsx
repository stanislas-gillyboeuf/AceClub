import { Platform, View, StyleSheet, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { glass } from "@/constants/theme";

interface BlurSurfaceProps extends ViewProps {
  intensity?: number;
  tintColor?: string;
  borderColor?: string;
}

/**
 * Frosted-glass panel/pill for photo-backed cards (event cover images, etc.) — expo-blur's
 * BlurView tinted by `glass.*` theme tokens. Android falls back to a flat, mostly-opaque surface
 * since BlurView support is inconsistent there (see `glass.panelTintAndroidFallback`).
 */
export function BlurSurface({
  style,
  intensity = 50,
  tintColor,
  borderColor,
  children,
  ...rest
}: BlurSurfaceProps) {
  const scheme = useColorScheme();
  const border = borderColor ?? glass.panelBorder[scheme];

  if (Platform.OS === "android") {
    return (
      <View
        style={[
          styles.base,
          { backgroundColor: tintColor ?? glass.panelTintAndroidFallback[scheme], borderColor: border },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.base, { borderColor: border }, style]} {...rest}>
      <BlurView intensity={intensity} tint={scheme} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor ?? glass.panelTint[scheme] }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: "hidden",
  },
});
