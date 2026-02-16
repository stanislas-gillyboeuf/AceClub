import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
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
  const { width: screenWidth } = useWindowDimensions();
  const tier = getLevelTier(item.user?.level ?? 1);

  const displayName = item.user?.name ?? "Joueur";
  const intentType = item.intent.type ?? "match";
  const typeLabel = intentType === "match" ? "Match" : "Entra\u00eenement";
  const TypeIcon = intentType === "match" ? Trophy : Dumbbell;

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero photo */}
        <View style={[styles.heroContainer, { width: screenWidth }]}>
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
              <View style={styles.heroInitials}>
                <Text style={styles.heroInitialsText}>
                  {item.user ? getInitials(item.user.name) : "?"}
                </Text>
              </View>
            </LinearGradient>
          )}

          <LinearGradient
            colors={["transparent", semanticColors.primaryBackground[scheme]]}
            style={styles.heroGradient}
          />

          {/* Close button */}
          <Pressable
            style={[styles.closeButton, { backgroundColor: semanticColors.cardBackground[scheme] }]}
            onPress={onClose}
          >
            <X size={18} color={semanticColors.labelSecondary[scheme]} strokeWidth={2.5} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Profile info */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Text
                style={[styles.profileName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <View style={styles.levelBadge}>
                <TypeIcon size={14} color={tier.color} strokeWidth={2.5} />
                <Text style={[styles.levelText, { color: semanticColors.labelSecondary[scheme] }]}>
                  Niv. {item.user?.level ?? 1}
                </Text>
              </View>
            </View>

            {item.user?.organization && (
              <View style={styles.orgRow}>
                <Building2 size={14} color={colors.accentGreen} strokeWidth={2} />
                <Text style={[styles.orgText, { color: colors.accentGreen }]}>
                  {item.user.organization.name}
                </Text>
              </View>
            )}

            {item.distance != null && (
              <View style={styles.distanceRow}>
                <MapPin size={14} color={semanticColors.labelSecondary[scheme]} strokeWidth={2} />
                <Text style={[styles.distanceText, { color: semanticColors.labelSecondary[scheme] }]}>
                  {formatDistance(item.distance)}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: semanticColors.divider[scheme] }]} />

          {/* Availability section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Disponibilit\u00e9
            </Text>
            <View
              style={[
                styles.availabilityCard,
                {
                  backgroundColor: semanticColors.cardBackground[scheme],
                  borderColor: semanticColors.borderColor[scheme],
                },
              ]}
            >
              <DetailRow
                icon={TypeIcon}
                title="Type"
                value={typeLabel}
                iconColor={colors.accentGreen}
                scheme={scheme}
              />
              {(item.intent.date ?? item.intent.scheduledDate) && (
                <DetailRow
                  icon={Calendar}
                  title="Date"
                  value={formatFullDate((item.intent.date ?? item.intent.scheduledDate)!)}
                  iconColor={colors.accentGreen}
                  scheme={scheme}
                />
              )}
              {(item.intent.time ?? item.intent.scheduledTime) && (
                <DetailRow
                  icon={Clock}
                  title="Heure"
                  value={formatTime((item.intent.time ?? item.intent.scheduledTime)!)}
                  iconColor={colors.accentGreen}
                  scheme={scheme}
                />
              )}
              {item.intent.duration != null && item.intent.duration > 0 && (
                <DetailRow
                  icon={Timer}
                  title="Dur\u00e9e"
                  value={formatDuration(item.intent.duration)}
                  iconColor={colors.accentGreen}
                  scheme={scheme}
                />
              )}
            </View>
          </View>

          {/* Description section */}
          {((item.intent.description ?? item.intent.message) ?? "").length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semanticColors.labelPrimary[scheme] }]}>
                Note
              </Text>
              <View
                style={[
                  styles.descriptionCard,
                  {
                    backgroundColor: semanticColors.cardBackground[scheme],
                    borderColor: semanticColors.borderColor[scheme],
                  },
                ]}
              >
                <Text style={[styles.descriptionText, { color: semanticColors.labelSecondary[scheme] }]}>
                  {item.intent.description ?? item.intent.message}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: semanticColors.cardBackground[scheme] },
        ]}
      >
        <Pressable
          style={styles.passActionButton}
          onPress={() => {
            onPass();
            onClose();
          }}
        >
          <X size={24} color={colors.red500} strokeWidth={2.5} />
        </Pressable>

        <Pressable
          style={[styles.likeActionButton, { backgroundColor: colors.accentGreen }]}
          onPress={() => {
            onLike();
            onClose();
          }}
        >
          <Trophy size={18} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.likeActionText}>Proposer un match</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface DetailRowProps {
  icon: any;
  title: string;
  value: string;
  iconColor: string;
  scheme: "light" | "dark";
}

function DetailRow({ icon: Icon, title, value, iconColor, scheme }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Icon size={16} color={iconColor} strokeWidth={2} />
      <Text style={[styles.detailTitle, { color: semanticColors.labelSecondary[scheme] }]}>
        {title}
      </Text>
      <View style={styles.detailSpacer} />
      <Text style={[styles.detailValue, { color: semanticColors.labelPrimary[scheme] }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 400,
    overflow: "hidden",
  },
  heroInitials: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitialsText: {
    fontSize: 80,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  closeButton: {
    position: "absolute",
    top: 56,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    paddingHorizontal: spacing.horizontal,
    paddingBottom: 100,
  },
  profileSection: {
    paddingTop: 20,
    gap: 12,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileName: {
    fontSize: 28,
    fontWeight: "700",
    flex: 1,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  levelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orgText: {
    fontSize: 15,
    fontWeight: "500",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  section: {
    gap: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  availabilityCard: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailTitle: {
    fontSize: 15,
  },
  detailSpacer: {
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  descriptionCard: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: spacing.horizontal,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  passActionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.red500,
  },
  likeActionButton: {
    flex: 1,
    height: 56,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  likeActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
