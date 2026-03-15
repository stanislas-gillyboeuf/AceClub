import { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, Switch, Platform, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { MapPin, Clock, Bell } from "lucide-react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing, radii } from "@/constants/theme";
import { MapPreview } from "@/features/matches/components/match-detail/map-preview";
import {
  haversineDistance,
  estimateTravelTimeMinutes,
} from "@/lib/format";
import {
  scheduleDepartureReminder,
  cancelDepartureReminder,
} from "@/lib/notifications";
import { useMatch } from "@/hooks/use-match";

export default function VenueDetailSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const { data: matchDetail, isLoading } = useMatch(id);
  const venue = matchDetail?.venueOrganization;
  const scheduledAt = matchDetail?.match.scheduledAt;
  const isScheduled = matchDetail?.match.status === "scheduled";
  const matchId = matchDetail?.match.id ?? id;

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const userCoords = useUserLocation();

  const travelMinutes = useMemo(() => {
    if (
      Platform.OS !== "ios" ||
      !userCoords ||
      !venue?.latitude ||
      !venue?.longitude
    )
      return null;
    const dist = haversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      venue.latitude,
      venue.longitude
    );
    return estimateTravelTimeMinutes(dist);
  }, [userCoords, venue?.latitude, venue?.longitude]);

  const travelText = useMemo(() => {
    if (travelMinutes == null) return null;
    if (travelMinutes < 1) return "< 1 min";
    return `~${travelMinutes} min`;
  }, [travelMinutes]);

  const showReminder =
    Platform.OS === "ios" && isScheduled && !!scheduledAt && travelMinutes != null;

  const handleToggleReminder = useCallback(
    async (value: boolean) => {
      setReminderEnabled(value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (value && scheduledAt && travelMinutes != null) {
        await scheduleDepartureReminder(matchId, scheduledAt, travelMinutes);
      } else {
        await cancelDepartureReminder(matchId);
      }
    },
    [matchId, scheduledAt, travelMinutes]
  );

  if (isLoading || !venue) {
    return (
      <>
        <Stack.Screen options={{ title: "Lieu" }} />
        <View style={[styles.center, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <ActivityIndicator size="small" color={colors.accentGreen} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: venue.name }} />
      <View style={[styles.root, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        {/* Map */}
        {Platform.OS === "ios" && venue.latitude != null && venue.longitude != null && (
          <MapPreview
            latitude={venue.latitude}
            longitude={venue.longitude}
            title={venue.name}
          />
        )}

        {/* Venue info */}
        <View style={[styles.card, {
          backgroundColor: semanticColors.cardBackground[scheme],
          borderColor: semanticColors.borderColor[scheme],
        }]}>
          <View style={styles.row}>
            <MapPin size={16} color={colors.accentGreen} strokeWidth={2} />
            <View style={styles.textGroup}>
              <Text style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}>
                {venue.name}
              </Text>
              {venue.address && (
                <Text style={[styles.address, { color: semanticColors.labelSecondary[scheme] }]}>
                  {venue.address}
                </Text>
              )}
            </View>
          </View>

          {/* Travel time */}
          {travelText && (
            <View style={styles.row}>
              <Clock size={16} color={colors.accentGreen} strokeWidth={2} />
              <Text style={[styles.travelLabel, { color: semanticColors.labelPrimary[scheme] }]}>
                Temps de trajet estimé
              </Text>
              <View style={styles.travelBadge}>
                <Text style={styles.travelText}>{travelText}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Reminder toggle */}
        {showReminder && (
          <View style={[styles.card, {
            backgroundColor: semanticColors.cardBackground[scheme],
            borderColor: semanticColors.borderColor[scheme],
          }]}>
            <View style={styles.reminderRow}>
              <Bell size={16} color={colors.accentGreen} strokeWidth={2} />
              <View style={styles.reminderTextGroup}>
                <Text style={[styles.reminderLabel, { color: semanticColors.labelPrimary[scheme] }]}>
                  Rappel de départ
                </Text>
                <Text style={[styles.reminderSub, { color: semanticColors.labelSecondary[scheme] }]}>
                  Notification ~{travelMinutes! + 10} min avant le match
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ true: colors.accentGreen }}
              />
            </View>
          </View>
        )}
      </View>
    </>
  );
}

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
        // Location unavailable
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.horizontal,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: spacing.card,
    borderRadius: radii.md,
    borderWidth: 0.5,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  address: {
    fontSize: 13,
  },
  travelLabel: {
    flex: 1,
    fontSize: 14,
  },
  travelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${colors.accentGreen}18`,
  },
  travelText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reminderTextGroup: {
    flex: 1,
    gap: 2,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  reminderSub: {
    fontSize: 11,
  },
});
