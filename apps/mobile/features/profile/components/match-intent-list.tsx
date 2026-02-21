import { useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import {
  Trash2,
  Swords,
  Dumbbell,
  Calendar,
  Clock,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";
import Button from "@/components/ui/button";
import type { MatchIntent } from "@/types/match-intent";

interface MatchIntentListProps {
  intents: MatchIntent[];
  isLoading: boolean;
  error?: string | null;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  deletingId?: string | null;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

function formatIntentDate(intent: MatchIntent): string {
  const date = new Date(intent.date);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;
  const h = date.getHours();
  const m = date.getMinutes();
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

function getRelativeLabel(dateStr: string): string | null {
  if (isToday(dateStr)) return "Aujourd'hui";
  if (isTomorrow(dateStr)) return "Demain";
  return null;
}

function DeleteRightAction({
  drag,
  onPress,
}: {
  drag: SharedValue<number>;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + 68 }],
  }));

  return (
    <Animated.View style={[styles.deleteAction, animatedStyle]}>
      <Pressable onPress={onPress} style={styles.deleteActionInner}>
        <Trash2 size={20} color="#FFFFFF" strokeWidth={1.5} />
      </Pressable>
    </Animated.View>
  );
}

function SwipeableIntent({
  intent,
  isLast,
  deletingId,
  onDelete,
  scheme,
}: {
  intent: MatchIntent;
  isLast: boolean;
  deletingId?: string | null;
  onDelete: (id: string) => void;
  scheme: "light" | "dark";
}) {
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
  const relativeLabel = getRelativeLabel(intent.date);

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
        {/* Type icon */}
        <View
          style={[styles.intentIcon, { backgroundColor: `${accentColor}1A` }]}
        >
          {isMatch ? (
            <Swords size={20} color={accentColor} strokeWidth={1.5} />
          ) : (
            <Dumbbell size={20} color={accentColor} strokeWidth={1.5} />
          )}
        </View>

        {/* Info */}
        <View style={styles.intentInfo}>
          <View style={styles.intentTopRow}>
            <Text
              style={[
                styles.intentType,
                { color: semanticColors.labelPrimary[scheme] },
              ]}
            >
              {isMatch ? "Match" : "Entraînement"}
            </Text>
            {relativeLabel && (
              <View
                style={[
                  styles.relativeBadge,
                  { backgroundColor: `${accentColor}1A` },
                ]}
              >
                <Text style={[styles.relativeBadgeText, { color: accentColor }]}>
                  {relativeLabel}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.intentDetails}>
            <View style={styles.detailItem}>
              <Calendar
                size={13}
                color={semanticColors.labelTertiary[scheme]}
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.intentDate,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {formatIntentDate(intent)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Clock
                size={13}
                color={semanticColors.labelTertiary[scheme]}
                strokeWidth={1.5}
              />
              <Text
                style={[
                  styles.intentDate,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                {formatTime(intent.time)} · {formatDuration(intent.duration)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}

export function MatchIntentList({
  intents,
  isLoading,
  error,
  onDelete,
  onCreateNew,
  deletingId,
}: MatchIntentListProps) {
  const scheme = useColorScheme();

  return (
    <Card>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
          Mes dispos
        </Text>
        {intents.length > 0 && (
          <Text style={[styles.count, { color: semanticColors.labelSecondary[scheme] }]}>
            {intents.length}
          </Text>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={10} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="60%" height={16} borderRadius={4} />
              <Skeleton width="80%" height={14} borderRadius={4} />
            </View>
          </View>
          <View style={styles.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={10} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="50%" height={16} borderRadius={4} />
              <Skeleton width="70%" height={14} borderRadius={4} />
            </View>
          </View>
        </View>
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.red500 }]}>{error}</Text>
      ) : intents.length === 0 ? (
        <EmptyState
          icon="MessageSquare"
          title="Aucun match ou entraînement demandé"
        />
      ) : (
        <View style={styles.list}>
          {intents.map((intent, index) => (
            <SwipeableIntent
              key={intent.id}
              intent={intent}
              isLast={index === intents.length - 1}
              deletingId={deletingId}
              onDelete={onDelete}
              scheme={scheme}
            />
          ))}
        </View>
      )}
      <Button
        label="Publier une dispo"
        onPress={onCreateNew}
        variant="secondary"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  count: {
    fontSize: 15,
  },
  skeletonContainer: {
    gap: 12,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
    marginBottom: 12,
  },
  list: {
    marginBottom: 12,
    overflow: "hidden",
    borderRadius: radii.sm,
  },
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
  deleteAction: {
    width: 68,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionInner: {
    width: 68,
    height: "100%",
    backgroundColor: colors.red500,
    justifyContent: "center",
    alignItems: "center",
  },
});
