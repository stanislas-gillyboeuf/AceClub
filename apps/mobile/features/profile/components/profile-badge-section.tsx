import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { Badge } from "@/types/reward";

interface ProfileBadgeSectionProps {
  badges: Badge[];
  totalBadges: number;
}

export function ProfileBadgeSection({ badges, totalBadges }: ProfileBadgeSectionProps) {
  const scheme = useColorScheme();

  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const recentBadges = unlockedBadges.slice(0, 4);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
          Badges
        </Text>
        <Text style={[styles.count, { color: semanticColors.labelSecondary[scheme] }]}>
          {unlockedBadges.length}/{totalBadges}
        </Text>
      </View>

      {recentBadges.length === 0 ? (
        <Text style={[styles.empty, { color: semanticColors.labelTertiary[scheme] }]}>
          Aucun badge
        </Text>
      ) : (
        <View style={styles.badgeRow}>
          {recentBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <Image
                source={{ uri: badge.imageUrl }}
                style={styles.badgeImage}
                contentFit="contain"
                transition={200}
              />
              <Text
                style={[styles.badgeName, { color: semanticColors.labelSecondary[scheme] }]}
                numberOfLines={1}
              >
                {badge.nameFr}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  empty: {
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  badgeImage: {
    width: 48,
    height: 48,
  },
  badgeName: {
    fontSize: 11,
    textAlign: "center",
  },
});
