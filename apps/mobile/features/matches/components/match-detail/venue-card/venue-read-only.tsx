import { View, Text, Pressable, StyleSheet } from "react-native";
import { MapPin, MapPinOff, ChevronRight, Pencil } from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchDetail } from "@/types/match";
import type { Organization } from "@/types/organization";

interface VenueReadOnlyProps {
  matchDetail: MatchDetail;
  venue: Organization | null | undefined;
  scheme: "light" | "dark";
  canChange?: boolean;
}

export function VenueReadOnly({ matchDetail, venue, scheme, canChange }: VenueReadOnlyProps) {
  const router = useRouter();
  const matchId = matchDetail.match.id;

  const handlePress = () => {
    if (!venue) return;
    router.push(`/matches/${matchId}/venue-detail` as any);
  };

  const handleChange = () => {
    router.push(`/matches/${matchId}/change-venue` as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
          LIEU
        </Text>
        {canChange && (
          <Pressable onPress={handleChange} hitSlop={8} style={styles.changeButton}>
            <Pencil size={12} color={colors.accentGreen} strokeWidth={2.5} />
            <Text style={styles.changeText}>Modifier</Text>
          </Pressable>
        )}
      </View>

      <Pressable onPress={venue ? handlePress : canChange ? handleChange : undefined} disabled={!venue && !canChange}>
        {venue ? (
          <View style={styles.venueRow}>
            <MapPin size={14} color={colors.accentGreen} strokeWidth={2} />
            <View style={styles.venueInfo}>
              <Text style={[styles.venueName, { color: semanticColors.labelPrimary[scheme] }]}>
                {venue.name}
              </Text>
              {venue.address && (
                <Text
                  style={[styles.venueAddress, { color: semanticColors.labelTertiary[scheme] }]}
                  numberOfLines={1}
                >
                  {venue.address}
                </Text>
              )}
            </View>
            <ChevronRight size={16} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
          </View>
        ) : (
          <View style={styles.venueRow}>
            <MapPinOff size={14} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
            <Text style={[styles.noVenue, { color: semanticColors.labelTertiary[scheme] }]}>
              {canChange ? "Choisir un lieu" : "Lieu non défini"}
            </Text>
            {canChange && (
              <ChevronRight size={16} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${colors.accentGreen}18`,
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  venueInfo: {
    flex: 1,
    gap: 1,
  },
  venueName: {
    fontSize: 14,
    fontWeight: "500",
  },
  venueAddress: {
    fontSize: 11,
  },
  noVenue: {
    flex: 1,
    fontSize: 14,
  },
});
