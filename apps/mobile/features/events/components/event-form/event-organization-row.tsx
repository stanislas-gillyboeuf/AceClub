import { Text, StyleSheet } from "react-native";
import { Building2 } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { Organization } from "@/types/organization";

interface EventOrganizationRowProps {
  organization: Organization | null;
  isLoading: boolean;
  scheme: "light" | "dark";
}

export function EventOrganizationRow({ organization, isLoading, scheme }: EventOrganizationRowProps) {
  return (
    <GlassView style={styles.container}>
      <Building2
        size={20}
        color={organization ? colors.accentGreen : semanticColors.labelTertiary[scheme]}
        strokeWidth={1.5}
      />
      <Text
        style={[
          styles.label,
          {
            color: organization
              ? semanticColors.labelPrimary[scheme]
              : semanticColors.labelSecondary[scheme],
          },
        ]}
        numberOfLines={1}
      >
        {organization?.name ?? (isLoading ? "Chargement..." : "Aucun club")}
      </Text>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
});
