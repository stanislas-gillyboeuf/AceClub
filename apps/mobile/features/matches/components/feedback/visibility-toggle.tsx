import { View, Text, Switch, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";

interface VisibilityToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export function VisibilityToggle({ value, onValueChange }: VisibilityToggleProps) {
  const scheme = useColorScheme();

  return (
    <GlassView style={styles.container}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
          Montrer au club
        </Text>
        <Text style={[styles.description, { color: semanticColors.labelSecondary[scheme] }]}>
          Le match apparaîtra dans le feed de ton club
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray300, true: colors.accentGreen }}
      />
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.card,
    borderRadius: radii.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 12,
  },
});
