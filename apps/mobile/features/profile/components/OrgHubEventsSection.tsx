import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Plus, Calendar, Users } from "lucide-react-native";

import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { EVENT_STATUS_MAP } from "@/features/events/lib/event-status";
import { formatShortDate, formatTime } from "@/lib/format";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { AdminEventItem } from "@/types/event";

function EventRow({ item, onPress }: { item: AdminEventItem; onPress: () => void }) {
  const scheme = useColorScheme();
  const statusConfig = EVENT_STATUS_MAP[item.status];
  const statusColor = statusConfig?.color ?? colors.gray400;
  const statusLabel = statusConfig?.label ?? item.status;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <GlassView style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text
            style={[styles.eventTitle, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.eventMeta}>
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

interface OrgHubEventsSectionProps {
  events: AdminEventItem[];
  isLoading: boolean;
}

export function OrgHubEventsSection({ events, isLoading }: OrgHubEventsSectionProps) {
  const scheme = useColorScheme();
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
          Events
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/profile/admin/create-event")}
          hitSlop={8}
        >
          <Plus size={22} color={colors.accentGreen} strokeWidth={2} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.accentGreen} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: semanticColors.labelSecondary[scheme] }]}>
            Aucun event pour le moment
          </Text>
        </View>
      ) : (
        <View style={styles.eventList}>
          {events.map((item) => (
            <EventRow
              key={item.id}
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/profile/admin/edit-event",
                  params: { eventId: item.id },
                })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  eventList: {
    gap: 10,
  },
  eventCard: {
    padding: 16,
    borderRadius: radii.md,
    gap: 10,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  eventTitle: {
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
  eventMeta: {
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
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
