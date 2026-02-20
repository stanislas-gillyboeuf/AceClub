import { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Building2 } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMyOrganizations, useUserOrganizations } from "@/hooks/use-organization";
import { useCreateMatchFormStore } from "@/store/create-match-form";
import { useStepperActions } from "./steper";
import { VenueTile } from "../components/venue-tile";
import { colors, semanticColors } from "@/constants/theme";

export default function Step3() {
  const scheme = useColorScheme();
  const venue = useCreateMatchFormStore((s) => s.venue);
  const setVenue = useCreateMatchFormStore((s) => s.setVenue);
  const awayUser = useCreateMatchFormStore((s) => s.awayUser);
  const { next } = useStepperActions();
  const didAutoSkip = useRef(false);

  const { data: myOrgs, isLoading: loadingMyOrgs } = useMyOrganizations();
  const { data: opponentOrgs, isLoading: loadingOpponentOrgs } =
    useUserOrganizations(awayUser?.id ?? "");

  const isLoading = loadingMyOrgs || loadingOpponentOrgs;

  // Merge organizations, deduplicate by id
  const allOrgs = (() => {
    const map = new Map<string, (typeof myOrgs extends (infer U)[] | undefined ? U : never)>();
    for (const org of myOrgs ?? []) map.set(org.id, org);
    for (const org of opponentOrgs ?? []) {
      if (!map.has(org.id)) map.set(org.id, org);
    }
    return Array.from(map.values());
  })();

  // Auto-skip if only 1 unique club
  useEffect(() => {
    if (isLoading || didAutoSkip.current) return;
    if (allOrgs.length === 1) {
      didAutoSkip.current = true;
      setVenue(allOrgs[0]);
      next();
    }
  }, [isLoading, allOrgs.length]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: semanticColors.labelPrimary[scheme] },
        ]}
      >
        Où jouer ?
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accentGreen} />
        </View>
      ) : allOrgs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2
            size={40}
            color={semanticColors.labelTertiary[scheme]}
            strokeWidth={1.5}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: semanticColors.labelSecondary[scheme] },
            ]}
          >
            Aucun club trouvé
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: semanticColors.labelTertiary[scheme] },
            ]}
          >
            Le lieu sera déterminé automatiquement
          </Text>
        </View>
      ) : (
        <View style={styles.venueList}>
          {allOrgs.map((org) => (
            <VenueTile
              key={org.id}
              organization={org}
              isSelected={venue?.id === org.id}
              onPress={() =>
                setVenue(venue?.id === org.id ? null : org)
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  venueList: {
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 15,
  },
  emptySubtitle: {
    fontSize: 13,
  },
});
