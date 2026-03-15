import { useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { MapPin, MapPinOff, Clock, ChevronRight, Building2 } from "lucide-react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { GlassView } from "@/components/ui/glass-view";
import { MapPreview } from "./map-preview";
import { haversineDistance, estimateTravelTime } from "@/lib/format";
import { useUpdateVenue } from "@/hooks/use-match";
import type { MatchDetail } from "@/types/match";
import type { Organization } from "@/types/organization";

interface VenueCardProps {
  matchDetail: MatchDetail;
  isParticipant: boolean;
  isScheduled: boolean;
}

export function VenueCard({ matchDetail, isParticipant, isScheduled }: VenueCardProps) {
  const scheme = useColorScheme();
  const venue = matchDetail.venueOrganization;
  const matchId = matchDetail.match.id;

  const participantOrgs = useMemo(() => {
    const map = new Map<string, Organization>();
    for (const po of matchDetail.participantOrganizations ?? []) {
      if (!map.has(po.organization.id)) {
        map.set(po.organization.id, po.organization);
      }
    }
    return Array.from(map.values());
  }, [matchDetail.participantOrganizations]);

  const needsSelection = isScheduled && isParticipant && !venue && participantOrgs.length >= 2;
  const needsAutoSet = isScheduled && isParticipant && !venue && participantOrgs.length === 1;

  if (needsSelection) {
    return (
      <VenueSelection
        matchId={matchId}
        organizations={participantOrgs}
        scheme={scheme}
      />
    );
  }

  if (needsAutoSet) {
    return (
      <VenueAutoSet
        matchId={matchId}
        organization={participantOrgs[0]}
        scheme={scheme}
      />
    );
  }

  return (
    <VenueReadOnly
      matchDetail={matchDetail}
      venue={venue}
      scheme={scheme}
    />
  );
}

// --- Selection mode ---

function VenueSelection({
  matchId,
  organizations,
  scheme,
}: {
  matchId: string;
  organizations: Organization[];
  scheme: "light" | "dark";
}) {
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

function VenueOption({
  organization,
  userCoords,
  scheme,
  onPress,
}: {
  organization: Organization;
  userCoords: { latitude: number; longitude: number } | null;
  scheme: "light" | "dark";
  onPress: () => void;
}) {
  const travelText = useMemo(() => {
    if (
      Platform.OS !== "ios" ||
      !userCoords ||
      organization.latitude == null ||
      organization.longitude == null
    )
      return null;
    const dist = haversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      organization.latitude,
      organization.longitude
    );
    return estimateTravelTime(dist);
  }, [userCoords, organization.latitude, organization.longitude]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <GlassView style={styles.optionCard}>
        {Platform.OS === "ios" &&
          organization.latitude != null &&
          organization.longitude != null && (
            <MapPreview
              latitude={organization.latitude}
              longitude={organization.longitude}
              title={organization.name}
            />
          )}

        <View style={styles.optionInfo}>
          <View style={styles.optionHeader}>
            {organization.logo ? (
              <Image
                source={{ uri: organization.logo }}
                style={styles.optionLogo}
              />
            ) : (
              <View
                style={[
                  styles.optionLogoPlaceholder,
                  { backgroundColor: `${colors.accentGreen}26` },
                ]}
              >
                <Building2 size={16} color={colors.accentGreen} strokeWidth={2} />
              </View>
            )}
            <View style={styles.optionTextGroup}>
              <Text
                style={[styles.optionName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {organization.name}
              </Text>
              {organization.address && (
                <Text
                  style={[styles.optionAddress, { color: semanticColors.labelSecondary[scheme] }]}
                  numberOfLines={1}
                >
                  {organization.address}
                </Text>
              )}
            </View>
          </View>

          {travelText && (
            <View style={styles.travelBadge}>
              <Clock size={11} color={colors.accentGreen} strokeWidth={2} />
              <Text style={styles.travelText}>{travelText}</Text>
            </View>
          )}
        </View>
      </GlassView>
    </Pressable>
  );
}

// --- Auto-set mode ---

function VenueAutoSet({
  matchId,
  organization,
  scheme,
}: {
  matchId: string;
  organization: Organization;
  scheme: "light" | "dark";
}) {
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

// --- Read-only mode (tappable → opens venue-detail sheet) ---

function VenueReadOnly({
  matchDetail,
  venue,
  scheme,
}: {
  matchDetail: MatchDetail;
  venue: Organization | null | undefined;
  scheme: "light" | "dark";
}) {
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

// --- Hook: user location (iOS only) ---

function useUserLocation() {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {
        // Location unavailable — no badge
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}

// --- Styles ---

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

  // Selection
  selectionList: {
    gap: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  optionCard: {
    borderRadius: radii.md,
    overflow: "hidden",
  },
  optionInfo: {
    padding: 12,
    gap: 8,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  optionLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextGroup: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    fontSize: 15,
    fontWeight: "500",
  },
  optionAddress: {
    fontSize: 12,
  },
  travelBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${colors.accentGreen}18`,
  },
  travelText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accentGreen,
  },

  // Read-only
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
