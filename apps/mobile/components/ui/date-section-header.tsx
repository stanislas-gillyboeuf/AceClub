import { type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors, spacing } from "@/constants/theme";

interface DateSectionHeaderProps {
  title: string;
  /** Small colored dot before the title */
  dotColor?: string;
  /** Override title color (defaults to labelPrimary) */
  titleColor?: string;
  /** Optional trailing element (badge, icon…) */
  trailing?: ReactNode;
}

export function DateSectionHeader({
  title,
  dotColor,
  titleColor,
  trailing,
}: DateSectionHeaderProps) {
  const scheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: semanticColors.primaryBackground[scheme] },
      ]}
    >
      <View style={styles.content}>
        {dotColor && (
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        )}
        <Text
          style={[
            styles.title,
            { color: titleColor ?? semanticColors.labelPrimary[scheme] },
          ]}
        >
          {title}
        </Text>
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
});
