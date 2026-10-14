import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MapPin, Pencil } from "lucide-react-native";
import { useRouter } from "expo-router";
import { semanticColors, spacing, radii } from "@/constants/theme";
import { useUpdateVenue } from "@/hooks/use-match";
import type { Organization } from "@/types/organization";

interface VenueAutoSetProps {
  matchId: string;
  organization: Organization;
  scheme: "light" | "dark";
  canChange?: boolean;
}

export function VenueAutoSet({ matchId, organization, scheme, canChange }: VenueAutoSetProps) {
  const router = useRouter();
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
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: semanticColors.labelTertiary[scheme] }]}>
          LIEU
        </Text>
        {canChange && (
          <Pressable
            onPress={() => router.push(`/matches/${matchId}/change-venue` as any)}
            hitSlop={8}
            style={[styles.changeButton, { backgroundColor: `${semanticColors.accentGreen[scheme]}18` }]}
          >
            <Pencil size={12} color={semanticColors.accentGreen[scheme]} strokeWidth={2.5} />
            <Text style={[styles.changeText, { color: semanticColors.accentGreen[scheme] }]}>Modifier</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.venueRow}>
        <MapPin size={14} color={semanticColors.accentGreen[scheme]} strokeWidth={2} />
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
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
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
