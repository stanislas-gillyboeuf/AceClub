import { Platform, Pressable, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "@/components/ui/glass-view";
import { colors } from "@/constants/theme";

const FAB_SIZE = 56;
// Approximate native tab bar content height (excludes the safe-area inset, added separately).
const TAB_BAR_HEIGHT = Platform.select({ ios: 49, default: 64 });

export function DiscoverFab() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOnDiscoverTab = pathname === "/discover";
  if (!isOnDiscoverTab) return null;

  const bottom = insets.bottom + TAB_BAR_HEIGHT - FAB_SIZE / 2;

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/profile/create-intent")}
      style={({ pressed }) => [styles.fab, { bottom }, pressed && styles.fabPressed]}
    >
      <GlassView style={styles.fabGlass} tintColor={colors.accentGreen}>
        <Plus size={26} color={colors.white} strokeWidth={2.5} />
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 20,
  },
  fabGlass: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
