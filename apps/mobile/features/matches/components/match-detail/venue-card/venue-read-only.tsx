import { View, Text, Pressable, StyleSheet } from "react-native";
import { MapPin, MapPinOff, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import type { MatchDetail } from "@/types/match";
import type { Organization } from "@/types/organization";

interface VenueReadOnlyProps {
  matchDetail: MatchDetail;
  venue: Organization | null | undefined;
  scheme: "light" | "dark";
}

export function VenueReadOnly({ matchDetail, venue, scheme }: VenueReadOnlyProps) {
  const router = useRouter();
  const matchId = matchDetail.match.id;

  const handlePress = () => {
    if (!venue) return;
    router.push(`/matches/${matchId}/venue-detail` as any);
  };

  return (
    <Pressable onPress={venue ? handlePress : undefined} disabled={!venue}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: semanticColors.cardBackground[scheme],
            borderColor: semanticColors.borderColor[scheme],
          },
        ]}
      >
        <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
          LIEU
        </Text>

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
              Lieu non défini
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
  },
  header: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
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
    fontSize: 14,
  },
});
