import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Calendar, MapPin } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { BadgePill } from "@/components/ui/badge-pill";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatTime } from "@/lib/format";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import type { MyEvent } from "@/types/event";

interface EventRowProps {
  event: MyEvent;
  onPress?: () => void;
}

export function EventRow({ event, onPress }: EventRowProps) {
  const scheme = useColorScheme();

  const badgeVariant =
    event.registrationStatus === "registered"
      ? "success"
      : event.registrationStatus === "waitlisted"
        ? "warning"
        : undefined;

  const badgeLabel =
    event.registrationStatus === "registered"
      ? "Inscrit"
      : event.registrationStatus === "waitlisted"
        ? "Liste d'attente"
        : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: semanticColors.cardBackground[scheme] },
        pressed && { opacity: 0.85 },
      ]}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
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
            <View style={styles.thumbnailPlaceholder}>
              <Calendar size={22} color={colors.accentGreen} strokeWidth={1.5} />
            </View>
          </View>
        )}
        {badgeVariant && badgeLabel && (
          <View style={styles.badgeOverlay}>
            <BadgePill label={badgeLabel} variant={badgeVariant} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.orgRow}>
          <Avatar
            imageUrl={event.organizationLogo}
            name={event.organizationName}
            size={14}
          />
          <Text
            style={[styles.orgName, { color: semanticColors.labelSecondary[scheme] }]}
            numberOfLines={1}
          >
            {event.organizationName}
          </Text>
        </View>
        <Text
          style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
          numberOfLines={1}
        >
          {event.name}
        </Text>
        <Text
          style={[styles.time, { color: semanticColors.labelSecondary[scheme] }]}
          numberOfLines={1}
        >
          {formatTime(event.startDate)}
          {event.address ? ` · ${event.address}` : ""}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: spacing.card,
    borderRadius: radii.md,
    gap: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOverlay: {
    position: "absolute",
    bottom: 4,
    left: 4,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orgName: {
    fontSize: 12,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
  },
});
