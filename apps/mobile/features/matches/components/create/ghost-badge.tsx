import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export function GhostBadge() {
  return (
    <View style={styles.ghostBadge}>
      <Text style={styles.ghostBadgeText}>Externe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ghostBadge: {
    backgroundColor: `${colors.accentGreen}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ghostBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accentGreen,
  },
});
