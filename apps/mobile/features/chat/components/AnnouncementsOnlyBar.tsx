import { View, Text, StyleSheet } from "react-native";
import { Megaphone } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

/** Replaces the chat input for a non-admin member of a group that's in "announcements only"
 * mode — read-only notice instead of a text field that would just fail server-side. */
export function AnnouncementsOnlyBar() {
  const scheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
      <Megaphone size={16} color={semanticColors.labelSecondary[scheme]} />
      <Text style={[styles.text, { color: semanticColors.labelSecondary[scheme] }]}>
        Seuls les administrateurs peuvent écrire dans ce groupe
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
  },
});
