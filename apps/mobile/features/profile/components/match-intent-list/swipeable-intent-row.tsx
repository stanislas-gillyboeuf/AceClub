import { useCallback, useRef } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Swords, Dumbbell, Calendar, Clock } from "lucide-react-native";
import { colors, semanticColors } from "@/constants/theme";
import type { MatchIntent } from "@/types/match-intent";
import { DeleteRightAction } from "./delete-right-action";

interface SwipeableIntentRowProps {
  intent: MatchIntent;
  isLast: boolean;
  deletingId?: string | null;
  onDelete: (id: string) => void;
  scheme: "light" | "dark";
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

const intentDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatIntentDate(intent: MatchIntent): string {
  if (!intent.date) return "Date flexible";
  const formatted = intentDateFormatter.format(new Date(intent.date));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatIntentTime(timeStr: string | null): string {
  if (!timeStr) return "À définir";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;
  const h = date.getHours();
  const m = date.getMinutes();
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function getRelativeLabel(dateStr: string): string | null {
  const d = new Date(dateStr);
  const now = new Date();
  if (isSameDay(d, now)) return "Aujourd'hui";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(d, tomorrow)) return "Demain";
  return null;
}

export function SwipeableIntentRow({
  intent,
  isLast,
  deletingId,
  onDelete,
  scheme,
}: SwipeableIntentRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleDelete = useCallback(() => {
    swipeableRef.current?.close();
    Alert.alert(
      "Supprimer la dispo",
      "Voulez-vous vraiment supprimer cette disponibilité ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => onDelete(intent.id) },
      ]
    );
  }, [intent.id, onDelete]);

  const isMatch = intent.type === "match";
  const accentColor = isMatch ? colors.accentGreen : colors.accentOrange;
  const relativeLabel = intent.date ? getRelativeLabel(intent.date) : null;

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      enabled={deletingId !== intent.id}
      renderRightActions={(_prog, drag) => (
        <DeleteRightAction drag={drag} onPress={handleDelete} />
      )}
    >
      <View
        style={[
          styles.intentRow,
          { backgroundColor: semanticColors.cardBackground[scheme] },
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: semanticColors.divider[scheme],
          },
        ]}
      >
        <View style={[styles.intentIcon, { backgroundColor: `${accentColor}1A` }]}>
          {isMatch ? (
            <Swords size={20} color={accentColor} strokeWidth={1.5} />
          ) : (
            <Dumbbell size={20} color={accentColor} strokeWidth={1.5} />
          )}
        </View>

        <View style={styles.intentInfo}>
          <View style={styles.intentTopRow}>
            <Text style={[styles.intentType, { color: semanticColors.labelPrimary[scheme] }]}>
              {isMatch ? "Match" : "Entraînement"}
            </Text>
            {intent.sport && (
              <Text style={[styles.sportLabel, { color: semanticColors.labelTertiary[scheme] }]}>
                {intent.sport === "padel" ? "Padel" : "Tennis"}
              </Text>
            )}
            {relativeLabel && (
              <View style={[styles.relativeBadge, { backgroundColor: `${accentColor}1A` }]}>
                <Text style={[styles.relativeBadgeText, { color: accentColor }]}>
                  {relativeLabel}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.intentDetails}>
            <View style={styles.detailItem}>
              <Calendar size={13} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
              <Text style={[styles.intentDate, { color: semanticColors.labelSecondary[scheme] }]}>
                {formatIntentDate(intent)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={13} color={semanticColors.labelTertiary[scheme]} strokeWidth={1.5} />
              <Text style={[styles.intentDate, { color: semanticColors.labelSecondary[scheme] }]}>
                {formatIntentTime(intent.time)} · {formatDuration(intent.duration)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  intentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  intentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  intentInfo: {
    flex: 1,
    gap: 4,
  },
  intentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  intentType: {
    fontSize: 16,
    fontWeight: "600",
  },
  sportLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  relativeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  relativeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  intentDetails: {
    gap: 2,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  intentDate: {
    fontSize: 13,
  },
});
