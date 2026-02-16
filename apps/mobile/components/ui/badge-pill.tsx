import { View, Text, StyleSheet } from "react-native";
import { radii } from "@/constants/theme";

type BadgeVariant = "success" | "danger" | "warning";

interface BadgePillProps {
  label: string;
  variant: BadgeVariant;
}

const variantColors: Record<BadgeVariant, string> = {
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#E8832A",
};

export function BadgePill({ label, variant }: BadgePillProps) {
  return (
    <View style={[styles.container, { backgroundColor: variantColors[variant] }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.xl,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
