import { type ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, radii } from "@/constants/theme";

interface CardSkeletonProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardSkeleton({ children, style }: CardSkeletonProps) {
  const scheme = useColorScheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
});
