import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Plus, Trash2, CalendarDays } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { MatchIntent } from "@/types/match-intent";

interface MatchIntentListProps {
  intents: MatchIntent[];
  isLoading: boolean;
  error?: string | null;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  deletingId?: string | null;
}

function formatIntentDate(intent: MatchIntent): string {
  if (!intent.scheduledDate) return "Flexible";
  const date = new Date(intent.scheduledDate);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  let result = formatter.format(date);
  if (intent.scheduledTime) {
    result += ` - ${intent.scheduledTime}`;
  }
  return result;
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

  const handleDelete = (id: string) => {
    Alert.alert(
      "Supprimer la dispo",
      "Voulez-vous vraiment supprimer cette disponibilité ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => onDelete(id) },
      ]
    );
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
          Mes dispos
        </Text>
        <Pressable onPress={onCreateNew} hitSlop={8}>
          <Plus size={22} color={colors.accentGreen} strokeWidth={2} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton width="100%" height={44} borderRadius={8} />
          <Skeleton width="100%" height={44} borderRadius={8} />
        </View>
      ) : error ? (
        <Text style={[styles.errorText, { color: "#ef4444" }]}>{error}</Text>
      ) : intents.length === 0 ? (
        <Text style={[styles.empty, { color: semanticColors.labelTertiary[scheme] }]}>
          Aucune dispo
        </Text>
      ) : (
        <View style={styles.list}>
          {intents.map((intent) => (
            <View
              key={intent.id}
              style={[
                styles.intentRow,
                { borderBottomColor: semanticColors.divider[scheme] },
              ]}
            >
              <CalendarDays
                size={18}
                color={semanticColors.labelSecondary[scheme]}
                strokeWidth={1.5}
              />
              <View style={styles.intentInfo}>
                <Text
                  style={[styles.intentSport, { color: semanticColors.labelPrimary[scheme] }]}
                >
                  {intent.sport === "tennis" ? "Tennis" : "Padel"} -{" "}
                  {intent.type === "singles" ? "Simple" : "Double"}
                </Text>
                <Text
                  style={[styles.intentDate, { color: semanticColors.labelSecondary[scheme] }]}
                >
                  {formatIntentDate(intent)}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(intent.id)}
                hitSlop={8}
                disabled={deletingId === intent.id}
                style={{ opacity: deletingId === intent.id ? 0.3 : 1 }}
              >
                <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
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
  skeletonContainer: {
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
  empty: {
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 12,
  },
  list: {
    gap: 0,
  },
  intentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  intentInfo: {
    flex: 1,
    gap: 2,
  },
  intentSport: {
    fontSize: 15,
    fontWeight: "500",
  },
  intentDate: {
    fontSize: 13,
  },
});
