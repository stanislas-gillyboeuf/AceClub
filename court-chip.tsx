import { Pressable, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { TreePine, Home } from "lucide-react-native";
import { colors, semanticColors, radii } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Court } from "@/types/court";

const surfaceLabels: Record<Court["surface"], string> = {
  clay: "Terre battue",
  hard: "Dur",
  grass: "Gazon",
  carpet: "Moquette",
};

interface CourtChipProps {
  court: Court;
  selected: boolean;
  onPress: () => void;
}

export function CourtChip({ court, selected, onPress }: CourtChipProps) {
  const scheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
    >
      <GlassView
        style={styles.card}
        tintColor={selected ? colors.accentGreen : undefined}
      >
        {court.location === "indoor" ? (
          <Home size={16} color={selected ? "#FFFFFF" : semanticColors.labelSecondary[scheme]} />
        ) : (
          <TreePine
            size={16}
            color={selected ? "#FFFFFF" : semanticColors.labelSecondary[scheme]}
          />
        )}
        <Text
          style={[
            styles.name,
            { color: selected ? "#FFFFFF" : semanticColors.labelPrimary[scheme] },
          ]}
        >
          {court.name}
        </Text>
        <Text
          style={[
            styles.surface,
            { color: selected ? "rgba(255,255,255,0.85)" : semanticColors.labelSecondary[scheme] },
          ]}
        >
          {surfaceLabels[court.surface]}
        </Text>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.md,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  card: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    alignItems: "center",
    gap: 4,
    minWidth: 110,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  surface: {
    fontSize: 12,
  },
});
