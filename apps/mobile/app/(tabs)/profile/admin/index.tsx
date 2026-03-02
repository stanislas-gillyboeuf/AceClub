import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Plus, Calendar, Users } from "lucide-react-native";

import { useAdminEvents } from "@/hooks/use-event";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { GlassView } from "@/components/ui/glass-view";
import { EVENT_STATUS_MAP } from "@/features/events/lib/event-status";
import { formatShortDate, formatTime } from "@/lib/format";
import type { AdminEventItem } from "@/types/event";

function EventRow({ item, onPress }: { item: AdminEventItem; onPress: () => void }) {
  const scheme = useColorScheme();
  const statusConfig = EVENT_STATUS_MAP[item.status];
  const statusColor = statusConfig?.color ?? colors.gray400;
  const statusLabel = statusConfig?.label ?? item.status;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
    <GlassView style={styles.card}>
      <View style={styles.cardHeader}>
        <Text
          style={[styles.cardTitle, { color: semanticColors.labelPrimary[scheme] }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaRow}>
          <Calendar size={14} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: semanticColors.labelSecondary[scheme] }]}>
            {formatShortDate(item.startDate)} · {formatTime(item.startDate)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Users size={14} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: semanticColors.labelSecondary[scheme] }]}>
            {item.participantCount}
            {item.maxParticipants ? ` / ${item.maxParticipants}` : ""} participants
          </Text>
        </View>
      </View>
    </GlassView>
    </Pressable>
  );
}

export default function AdminIndex() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { data: events, isLoading, refetch, isRefetching } = useAdminEvents({ limit: 50 });

  const renderItem = ({ item }: { item: AdminEventItem }) => (
    <EventRow
      item={item}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/profile/admin/edit-event",
          params: { eventId: item.id },
        })
      }
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/profile/admin/create-event")}
              hitSlop={8}
            >
              <Plus size={24} color={colors.accentGreen} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />

      <FlatList
        style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        data={events ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accentGreen} />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: semanticColors.labelSecondary[scheme] }]}>
                Aucun event pour le moment
              </Text>
            </View>
          )
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.horizontal,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: radii.md,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardMeta: {
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
