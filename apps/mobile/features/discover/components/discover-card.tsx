import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "@/components/ui/glass-view";
import {
  Calendar,
  Clock,
  Timer,
  Building2,
  MapPin,
  Trophy,
  Dumbbell,
} from "lucide-react-native";
import { TagChip } from "@/components/ui/tag-chip";
import { colors } from "@/constants/theme";
import {
  getInitials,
  formatShortDate,
  formatTime,
  formatDuration,
  formatDistance,
} from "@/lib/format";
import type { MatchIntentWithUser } from "@/types/match-intent";
import { getLevelTier } from "@/features/discover/lib/level-tiers";

interface DiscoverCardProps {
  item: MatchIntentWithUser;
}

export function DiscoverCard({ item }: DiscoverCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 40;
  const cardHeight = cardWidth / 0.7;
  const tier = getLevelTier(item.user?.level ?? 1);

  const displayName = item.user?.name ?? "Joueur";
  const intentType = item.intent.type ?? "match";
  const typeLabel = intentType === "match" ? "Match" : "Entra\u00eenement";
  const TypeIcon = intentType === "match" ? Trophy : Dumbbell;

  return (
    <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
      {/* Photo background */}
      {item.user?.image ? (
        <Image
          source={{ uri: item.user.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <LinearGradient
          colors={[`${tier.color}B3`, `${tier.color}4D`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>
              {item.user ? getInitials(item.user.name) : "?"}
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.65)"]}
        style={styles.bottomGradient}
      />

      {/* Top badges */}
      <View style={styles.topBadges}>
        {item.distance != null && (
          <GlassView style={styles.distanceBadge}>
            <MapPin size={10} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.distanceText}>
              {formatDistance(item.distance)}
            </Text>
          </GlassView>
        )}
        <View style={styles.spacer} />
        <GlassView
          style={styles.typeBadge}
          tintColor={intentType === "match" ? "#3B82F6" : "#F97316"}
        >
          <TypeIcon size={10} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.typeText}>{typeLabel}</Text>
        </GlassView>
      </View>

      {/* Info overlay at bottom */}
      <View style={styles.infoOverlay}>
        <Text style={styles.nameText} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.tagsContainer}>
          <TagChip
            icon={TypeIcon}
            label={`Niv. ${item.user?.level ?? 1}`}
            iconColor={tier.color}
          />
          {item.user?.organization && (
            <TagChip icon={Building2} label={item.user.organization.name} />
          )}
          {(item.intent.date ?? item.intent.scheduledDate) && (
            <TagChip
              icon={Calendar}
              label={formatShortDate((item.intent.date ?? item.intent.scheduledDate)!)}
            />
          )}
          {(item.intent.time ?? item.intent.scheduledTime) && (
            <TagChip
              icon={Clock}
              label={formatTime((item.intent.time ?? item.intent.scheduledTime)!)}
            />
          )}
          {item.intent.duration != null && item.intent.duration > 0 && (
            <TagChip
              icon={Timer}
              label={formatDuration(item.intent.duration)}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.gray600,
  },
  initialsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontSize: 80,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  topBadges: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  distanceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
});
