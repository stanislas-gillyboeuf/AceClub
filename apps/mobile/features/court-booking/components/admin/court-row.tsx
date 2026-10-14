import { View, Text, Pressable, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { Court } from "@/types/court";

const SURFACE_LABELS: Record<string, string> = {
  clay: "Terre battue",
  hard: "Dur",
  grass: "Gazon",
  carpet: "Moquette",
};

interface CourtRowProps {
  court: Court;
  onEdit: () => void;
  onToggleActive: () => void;
  isToggling: boolean;
}

export function CourtRow({ court, onEdit, onToggleActive, isToggling }: CourtRowProps) {
  const scheme = useColorScheme();
  const surfaceLabel = court.surface ? SURFACE_LABELS[court.surface] : null;
  const nameColor = court.isActive ? semanticColors.labelPrimary[scheme] : semanticColors.labelSecondary[scheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        },
        !court.isActive && styles.cardInactive,
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.name, { color: nameColor }]}>{court.name}</Text>
        <Text style={[styles.meta, { color: semanticColors.labelSecondary[scheme] }]}>
          {[surfaceLabel, court.indoor ? "Intérieur" : "Extérieur", `${court.slotDurationMinutes} min`]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        {court.pricePerHour != null && (
          <Text style={[styles.price, { color: semanticColors.accentGreen[scheme] }]}>{court.pricePerHour} € / heure</Text>
        )}
      </View>
      <View style={styles.actions}>
        {court.isActive ? (
          <>
            <Pressable onPress={onEdit} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: semanticColors.accentGreen[scheme] }]}>Modifier</Text>
            </Pressable>
            <Pressable onPress={onToggleActive} disabled={isToggling} style={styles.actionButton}>
              <Text style={[styles.destructiveText, { color: colors.red500 }]}>Désactiver</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onToggleActive}
            disabled={isToggling}
            style={[styles.reactivateButton, { backgroundColor: semanticColors.accentGreen[scheme] }]}
          >
            <Text style={[styles.reactivateText, { color: semanticColors.onAccentGreen[scheme] }]}>Réactiver</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardInactive: {
    opacity: 0.55,
  },
  info: {
    gap: 2,
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
  },
  meta: {
    fontSize: 12,
  },
  price: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontWeight: "600",
    fontSize: 13,
  },
  destructiveText: {
    fontWeight: "600",
    fontSize: 13,
  },
  reactivateButton: {
    alignSelf: "flex-start",
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reactivateText: {
    fontWeight: "600",
    fontSize: 13,
  },
});
