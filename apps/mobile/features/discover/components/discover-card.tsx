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
import { formatSkillLevel } from "@/lib/skill-levels";

interface DiscoverCardProps {
  item: MatchIntentWithUser;
  maxHeight?: number;
}

export function DiscoverCard({ item, maxHeight }: DiscoverCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 40;
  const idealHeight = cardWidth / 0.7;
  const cardHeight = maxHeight ? Math.min(idealHeight, maxHeight - 16) : idealHeight;
  const tier = getLevelTier(item.user?.level ?? 1);
  const ranking = formatSkillLevel(item.user?.skillLevel, item.user?.sport);

  const displayName = item.user?.name ?? "Joueur";
  const intentType = item.intent.type ?? "match";
  const typeLabel = intentType === "match" ? "Match" : "Entraînement";
  const TypeIcon = intentType === "match" ? Trophy : Dumbbell;

  return (
    <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
      {/* Photo background */}
      {item.user?.image ? (
        <Image
          recyclingKey={item.user.image}
          source={{ uri: item.user.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
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
          <GlassView style={styles.distanceBadge} tintColor="rgba(0,0,0,0.45)">
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

      {/* Prominent level badge */}
      <View style={[styles.levelCircle, { borderColor: tier.color }]}>
        <Text style={styles.levelCircleLabel}>NIVEAU</Text>
        <Text style={styles.levelCircleNumber}>
          {item.user?.level ?? 1}
        </Text>
      </View>

      {/* Info overlay at bottom */}
      <View style={styles.infoOverlay}>
        <Text style={styles.nameText} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.tagsContainer}>
          {ranking && (
            <TagChip icon={Trophy} label={ranking} iconColor={tier.color} />
          )}
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
  levelCircle: {
    position: "absolute",
    top: 64,
    right: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  levelCircleLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  levelCircleNumber: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    fontVariant: ["tabular-nums"],
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
