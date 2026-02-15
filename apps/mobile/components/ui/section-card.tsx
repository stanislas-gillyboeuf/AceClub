import { type ReactNode } from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, radii } from "@/constants/theme";

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}

export function SectionCard({ title, children, style }: SectionCardProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.wrapper}>
      {title && (
        <Text style={[styles.title, { color: semanticColors.labelSecondary[scheme] }]}>
          {title.toUpperCase()}
        </Text>
      )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  card: {
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
});
