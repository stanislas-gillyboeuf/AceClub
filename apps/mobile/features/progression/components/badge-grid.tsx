import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { getBadgeCategoryColor } from "@/lib/progression";
import type { Badge } from "@/types/reward";

interface BadgeGridProps {
  badges: Badge[];
}

const BADGE_SIZE = 70;
const COLUMNS = 3;
const GAP = 16;

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) return null;

  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} />
      ))}
    </View>
  );
}

interface BadgeItemProps {
  badge: Badge;
}

function BadgeItem({ badge }: BadgeItemProps) {
  const scheme = useColorScheme();
  const isUnlocked = badge.isUnlocked !== false;
  const categoryColor = getBadgeCategoryColor(badge.category);

  return (
    <View style={[styles.badgeContainer, !isUnlocked && { opacity: 0.5 }]}>
      <View style={styles.imageWrapper}>
        {badge.imageUrl ? (
          <Image
            source={{ uri: badge.imageUrl }}
            style={[
              styles.badgeImage,
              !isUnlocked && { opacity: 0.4 },
            ]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[
              styles.badgePlaceholder,
              { backgroundColor: `${categoryColor}26` },
            ]}
          >
            <Text style={[styles.placeholderIcon, { color: categoryColor }]}>
              ?
            </Text>
          </View>
        )}
        {!isUnlocked && (
          <View style={[styles.lockOverlay, { backgroundColor: semanticColors.systemGray5[scheme] }]}>
            <Lock size={16} color={colors.systemGray} />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.badgeName,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
        numberOfLines={2}
      >
        {badge.nameFr}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  badgeContainer: {
    width: BADGE_SIZE + 16,
    alignItems: "center",
    gap: 6,
  },
  imageWrapper: {
    position: "relative",
  },
  badgeImage: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
  },
  badgePlaceholder: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 28,
    fontWeight: "600",
  },
  lockOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
