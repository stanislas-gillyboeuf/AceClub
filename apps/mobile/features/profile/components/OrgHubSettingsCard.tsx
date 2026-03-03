import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Building2, ChevronRight, MapPin } from "lucide-react-native";
import { useRouter } from "expo-router";

import { GlassView } from "@/components/ui/glass-view";
import { MapPreview } from "@/features/matches/components/match-detail/map-preview";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { Organization } from "@/types/organization";

interface OrgHubSettingsCardProps {
  organization: Organization;
}

export function OrgHubSettingsCard({ organization }: OrgHubSettingsCardProps) {
  const scheme = useColorScheme();
  const router = useRouter();

  const hasCoords =
    organization.latitude != null && organization.longitude != null;

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/profile/admin/org-settings")}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <GlassView style={styles.card}>
        <View style={styles.row}>
          {organization.logo ? (
            <Image
              source={{ uri: organization.logo }}
              style={styles.logo}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Building2 size={24} color={colors.accentGreen} strokeWidth={1.5} />
            </View>
          )}

          <View style={styles.info}>
            <Text
              style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
              numberOfLines={1}
            >
              {organization.name}
            </Text>
            {organization.address && (
              <View style={styles.addressRow}>
                <MapPin size={12} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
                <Text
                  style={[styles.address, { color: semanticColors.labelSecondary[scheme] }]}
                  numberOfLines={1}
                >
                  {organization.address}
                </Text>
              </View>
            )}
          </View>

          <ChevronRight
            size={18}
            color={semanticColors.labelTertiary[scheme]}
            strokeWidth={2}
          />
        </View>

        {hasCoords && (
          <MapPreview
            latitude={organization.latitude!}
            longitude={organization.longitude!}
            title={organization.name}
          />
        )}
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: `${colors.accentGreen}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  address: {
    fontSize: 13,
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
