import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Calendar } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatShortDate, formatTime } from "@/lib/format";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import type { EventSummary, MyEvent } from "@/types/event";

interface EventPreviewCardProps {
  event: EventSummary | MyEvent;
  onPress?: () => void;
}

export function EventPreviewCard({ event, onPress }: EventPreviewCardProps) {
  const scheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: semanticColors.cardBackground[scheme] },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
      ]}
    >
      {/* Cover image */}
      <View style={styles.coverContainer}>
        {event.coverImage ? (
          <Image
            source={{ uri: event.coverImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `${colors.accentGreen}26` },
            ]}
          >
            <View style={styles.coverPlaceholder}>
              <Calendar size={28} color={colors.accentGreen} strokeWidth={1.5} />
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
          numberOfLines={1}
        >
          {event.name}
        </Text>
        <Text
          style={[styles.date, { color: semanticColors.labelSecondary[scheme] }]}
          numberOfLines={1}
        >
          {formatShortDate(event.startDate)} · {formatTime(event.startDate)}
        </Text>
        {event.organizationName ? (
          <View style={styles.orgRow}>
            <Avatar
              imageUrl={event.organizationLogo}
              name={event.organizationName}
              size={16}
            />
            <Text
              style={[styles.orgName, { color: semanticColors.labelSecondary[scheme] }]}
              numberOfLines={1}
            >
              {event.organizationName}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  coverContainer: {
    height: 100,
    overflow: "hidden",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.card,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  date: {
    fontSize: 13,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  orgName: {
    fontSize: 12,
    flex: 1,
  },
});
