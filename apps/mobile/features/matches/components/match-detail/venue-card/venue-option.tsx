import { useMemo } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { Clock, Building2 } from "lucide-react-native";
import { Image } from "expo-image";
import { colors, semanticColors, radii } from "@/constants/theme";
import { GlassView } from "@/components/ui/glass-view";
import { MapPreview } from "../map-preview";
import { haversineDistance, estimateTravelTime } from "@/lib/format";
import type { Organization } from "@/types/organization";
import type { UserCoords } from "@/hooks/use-user-location";

interface VenueOptionProps {
  organization: Organization;
  userCoords: UserCoords | null;
  scheme: "light" | "dark";
  onPress: () => void;
}

export function VenueOption({ organization, userCoords, scheme, onPress }: VenueOptionProps) {
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

const styles = StyleSheet.create({
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
});
