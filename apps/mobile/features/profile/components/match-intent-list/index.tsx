import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";
import Button from "@/components/ui/button";
import type { MatchIntent } from "@/types/match-intent";
import { SwipeableIntentRow } from "./swipeable-intent-row";

interface MatchIntentListProps {
  intents: MatchIntent[];
  isLoading: boolean;
  error?: string | null;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  deletingId?: string | null;
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[0, 1].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton width={44} height={44} borderRadius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width={i === 0 ? "60%" : "50%"} height={16} borderRadius={4} />
            <Skeleton width={i === 0 ? "80%" : "70%"} height={14} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
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

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.red500 }]}>{error}</Text>
      ) : intents.length === 0 ? (
        <EmptyState icon="MessageSquare" title="Aucun match ou entraînement demandé" />
      ) : (
        <View style={styles.list}>
          {intents.map((intent, index) => (
            <SwipeableIntentRow
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
      <Button label="Publier une dispo" onPress={onCreateNew} variant="secondary" />
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
});
