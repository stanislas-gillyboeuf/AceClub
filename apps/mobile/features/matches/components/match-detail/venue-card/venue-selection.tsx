import { View, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { semanticColors, spacing, radii } from "@/constants/theme";
import { useUpdateVenue } from "@/hooks/use-match";
import { useUserLocation } from "@/hooks/use-user-location";
import type { Organization } from "@/types/organization";
import { VenueOption } from "./venue-option";

interface VenueSelectionProps {
  matchId: string;
  organizations: Organization[];
  scheme: "light" | "dark";
}

export function VenueSelection({ matchId, organizations, scheme }: VenueSelectionProps) {
  const updateVenue = useUpdateVenue();
  const userCoords = useUserLocation();

  const handleSelect = (org: Organization) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateVenue.mutate({ id: matchId, venueOrganizationId: org.id });
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
      <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
        CHOISIR LE LIEU
      </Text>

      <View style={styles.selectionList}>
        {organizations.map((org) => (
          <VenueOption
            key={org.id}
            organization={org}
            userCoords={userCoords}
            scheme={scheme}
            onPress={() => handleSelect(org)}
          />
        ))}
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
  selectionList: {
    gap: 12,
  },
});
