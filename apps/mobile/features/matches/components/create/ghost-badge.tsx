import { View, Text, StyleSheet } from "react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function GhostBadge() {
  const scheme = useColorScheme();
  return (
    <View style={[styles.ghostBadge, { backgroundColor: `${semanticColors.accentGreen[scheme]}20` }]}>
      <Text style={[styles.ghostBadgeText, { color: semanticColors.accentGreen[scheme] }]}>Externe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ghostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ghostBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
