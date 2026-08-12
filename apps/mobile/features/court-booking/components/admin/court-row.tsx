import { View, Text, Pressable, StyleSheet } from "react-native";
import { courtColors, courtFonts } from "../../theme";
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
  const surfaceLabel = court.surface ? SURFACE_LABELS[court.surface] : null;

  return (
    <View style={[styles.card, !court.isActive && styles.cardInactive]}>
      <View style={styles.info}>
        <Text style={[styles.name, !court.isActive && styles.textMuted]}>{court.name}</Text>
        <Text style={styles.meta}>
          {[surfaceLabel, court.indoor ? "Intérieur" : "Extérieur", `${court.slotDurationMinutes} min`]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        {court.pricePerHour != null && (
          <Text style={styles.price}>{court.pricePerHour} € / heure</Text>
        )}
      </View>
      <View style={styles.actions}>
        {court.isActive ? (
          <>
            <Pressable onPress={onEdit} style={styles.actionButton}>
              <Text style={styles.actionText}>Modifier</Text>
            </Pressable>
            <Pressable onPress={onToggleActive} disabled={isToggling} style={styles.actionButton}>
              <Text style={styles.destructiveText}>Désactiver</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={onToggleActive} disabled={isToggling} style={styles.reactivateButton}>
            <Text style={styles.reactivateText}>Réactiver</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: courtColors.ink2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: courtColors.pineLine,
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
    fontFamily: courtFonts.bodyBold,
    fontSize: 16,
    color: courtColors.chalk,
  },
  textMuted: {
    color: courtColors.mist,
  },
  meta: {
    fontFamily: courtFonts.mono,
    fontSize: 12,
    color: courtColors.mist,
  },
  price: {
    fontFamily: courtFonts.mono,
    fontSize: 12,
    color: courtColors.ball,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 13,
    color: courtColors.ball,
  },
  destructiveText: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 13,
    color: courtColors.clay,
  },
  reactivateButton: {
    alignSelf: "flex-start",
    backgroundColor: courtColors.ball,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reactivateText: {
    fontFamily: courtFonts.bodySemiBold,
    fontSize: 13,
    color: courtColors.ink,
  },
});
