import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { GlassView } from "@/components/ui/glass-view";
import Button from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  Timer,
  Trophy,
  Dumbbell,
} from "lucide-react-native";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getInitials,
  formatFullDate,
  formatTime,
  formatDuration,
  formatDistance,
} from "@/lib/format";
import { getLevelTier } from "@/features/discover/lib/level-tiers";
import type { MatchIntentWithUser } from "@/types/match-intent";

interface DiscoverDetailSheetProps {
  item: MatchIntentWithUser;
  onLike: () => void;
  onPass: () => void;
  onClose: () => void;
}

export function DiscoverDetailSheet({
  item,
  onLike,
  onPass,
  onClose,
}: DiscoverDetailSheetProps) {
  const scheme = useColorScheme();
  const tier = getLevelTier(item.user?.level ?? 1);
  const TierIcon = tier.icon;

  const displayName = item.user?.name ?? "Joueur";
  const intentType = item.intent.type ?? "match";
  const typeLabel = intentType === "match" ? "Match" : "Entraînement";
  const TypeIcon = intentType === "match" ? Trophy : Dumbbell;

  const date = item.intent.date ?? item.intent.scheduledDate;
  const time = item.intent.time ?? item.intent.scheduledTime;

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Cover image */}
          {item.user?.image ? (
            <Image
              source={{ uri: item.user.image }}
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: semanticColors.skeleton[scheme] }]}>
              <Text style={styles.initialsText}>
                {item.user ? getInitials(item.user.name) : "?"}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text
            style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {/* Info rows */}
          <View style={styles.infoRow}>
            <TierIcon size={16} color={tier.color} strokeWidth={2} />
            <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
              Niveau {item.user?.level ?? 1} · {tier.label}
            </Text>
          </View>

          {item.user?.organization && (
            <View style={styles.infoRow}>
              <Building2 size={16} color={colors.accentGreen} strokeWidth={2} />
              <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                {item.user.organization.name}
              </Text>
            </View>
          )}

          {item.distance != null && (
            <View style={styles.infoRow}>
              <MapPin size={16} color={colors.accentGreen} strokeWidth={2} />
              <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                {formatDistance(item.distance)}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

          {/* Availability section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Disponibilité
            </Text>
            <GlassView style={styles.availabilityCard}>
              <View style={styles.cardRow}>
                <TypeIcon size={16} color={colors.accentGreen} strokeWidth={2} />
                <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                  {typeLabel}
                </Text>
              </View>
              {date && (
                <View style={styles.cardRow}>
                  <Calendar size={16} color={colors.accentGreen} strokeWidth={2} />
                  <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                    {formatFullDate(date)}
                  </Text>
                </View>
              )}
              {time && (
                <View style={styles.cardRow}>
                  <Clock size={16} color={colors.accentGreen} strokeWidth={2} />
                  <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                    {formatTime(time)}
                  </Text>
                </View>
              )}
              {item.intent.duration != null && item.intent.duration > 0 && (
                <View style={styles.cardRow}>
                  <Timer size={16} color={colors.accentGreen} strokeWidth={2} />
                  <Text style={[styles.infoText, { color: semanticColors.labelPrimary[scheme] }]}>
                    {formatDuration(item.intent.duration)}
                  </Text>
                </View>
              )}
            </GlassView>
          </View>

          {/* Description section */}
          {((item.intent.description ?? item.intent.message) ?? "").length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                À propos
              </Text>
              <GlassView style={styles.descriptionCard}>
                <Text style={[styles.descriptionText, { color: semanticColors.labelSecondary[scheme] }]}>
                  {item.intent.description ?? item.intent.message}
                </Text>
              </GlassView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action bar */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: semanticColors.cardBackground[scheme] },
        ]}
      >
        <Button
          label="Proposer un match"
          onPress={() => {
            onLike();
            onClose();
          }}
        />
        <Pressable
          onPress={() => {
            onPass();
            onClose();
          }}
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Text style={[styles.passText, { color: semanticColors.labelSecondary[scheme] }]}>
            Passer
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 120,
  },
  coverImage: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  coverPlaceholder: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontSize: 80,
    fontWeight: "700",
    color: "rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  section: {
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  availabilityCard: {
    padding: spacing.card,
    borderRadius: radii.md,
    gap: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  descriptionCard: {
    padding: spacing.card,
    borderRadius: radii.md,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.horizontal,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  passText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
