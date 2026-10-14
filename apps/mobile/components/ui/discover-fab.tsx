import { Platform, Pressable, Text, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface DiscoverFabProps {
  sport: "tennis" | "padel";
}

// Approximate native tab bar content height (excludes the safe-area inset, added separately).
const TAB_BAR_HEIGHT = Platform.select({ ios: 49, default: 64 });

/** "Crée ta demande" — floats just above the tab bar on the Discover ("Rechercher") tab, tinted
 * by the currently selected sport, same accent convention as PartnerRequestCard's accept pill. */
export function DiscoverFab({ sport }: DiscoverFabProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const accent = sport === "padel" ? colors.accentOrange : semanticColors.accentGreen[scheme];
  const onAccent = sport === "padel" ? colors.white : semanticColors.onAccentGreen[scheme];

  const bottom = insets.bottom + TAB_BAR_HEIGHT + 12;

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/profile/create-intent")}
      style={({ pressed }) => [styles.fab, { bottom }, pressed && styles.fabPressed]}
    >
      <GlassView style={styles.fabGlass} tintColor={accent}>
        <Plus size={20} color={onAccent} strokeWidth={2.5} />
        <Text style={[styles.label, { color: onAccent }]}>Crée ta demande</Text>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 20,
  },
  fabGlass: {
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
