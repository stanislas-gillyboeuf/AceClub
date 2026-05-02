import { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { useUpdateVenue } from "@/hooks/use-match";
import type { Organization } from "@/types/organization";

interface VenueAutoSetProps {
  matchId: string;
  organization: Organization;
  scheme: "light" | "dark";
}

export function VenueAutoSet({ matchId, organization, scheme }: VenueAutoSetProps) {
  const updateVenue = useUpdateVenue();
  const didAutoSet = useRef(false);

  useEffect(() => {
    if (didAutoSet.current) return;
    didAutoSet.current = true;
    updateVenue.mutate({ id: matchId, venueOrganizationId: organization.id });
  }, [matchId, organization.id]);

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
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        LIEU
      </Text>
      <View style={styles.venueRow}>
        <MapPin size={14} color={colors.accentGreen} strokeWidth={2} />
        <View style={styles.venueInfo}>
          <Text style={[styles.venueName, { color: semanticColors.labelPrimary[scheme] }]}>
            {organization.name}
          </Text>
          {organization.address && (
            <Text
              style={[styles.venueAddress, { color: semanticColors.labelTertiary[scheme] }]}
              numberOfLines={1}
            >
              {organization.address}
            </Text>
          )}
        </View>
      </View>
    </View>
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
});
