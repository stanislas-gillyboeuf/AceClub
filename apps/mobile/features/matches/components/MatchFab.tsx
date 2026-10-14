import { Pressable, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "@/components/ui/glass-view";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface MatchFabProps {
  onPress: () => void;
}

export function MatchFab({ onPress }: MatchFabProps) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { bottom: insets.bottom + 24 }, pressed && styles.fabPressed]}
    >
      <GlassView style={styles.fabGlass} tintColor={semanticColors.accentGreen[scheme]}>
        <Plus size={28} color={semanticColors.onAccentGreen[scheme]} />
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    alignSelf: "center",
  },
  fabGlass: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
