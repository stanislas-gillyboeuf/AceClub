import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Building2, ChevronRight } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { Organization } from "@/types/organization";

interface OrganizationCardProps {
  organization: Organization | null;
  memberRole?: string | null;
  onPress?: () => void;
}

export function OrganizationCard({
  organization,
  memberRole,
  onPress,
}: OrganizationCardProps) {
  const scheme = useColorScheme();

  if (!organization) {
    return (
      <Card>
        <View style={styles.header}>
          <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
            Mon Club
          </Text>
        </View>
        <Text style={[styles.empty, { color: semanticColors.labelTertiary[scheme] }]}>
          Aucun club
        </Text>
      </Card>
    );
  }

  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
          Mon Club
        </Text>
      </View>
      <View style={styles.orgRow}>
        {organization.logo ? (
          <Image
            source={{ uri: organization.logo }}
            style={styles.orgLogo}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.orgLogoPlaceholder}>
            <Building2 size={20} color={colors.accentGreen} strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.orgInfo}>
          <Text
            style={[styles.orgName, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            {organization.name}
          </Text>
          {memberRole && (
            <Text style={[styles.orgRole, { color: semanticColors.labelSecondary[scheme] }]}>
              {memberRole === "owner"
                ? "Propriétaire"
                : memberRole === "admin"
                  ? "Administrateur"
                  : "Membre"}
            </Text>
          )}
        </View>
        {onPress && (
          <ChevronRight
            size={18}
            color={semanticColors.labelTertiary[scheme]}
            strokeWidth={2}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  empty: {
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 12,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orgLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  orgLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${colors.accentGreen}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  orgInfo: {
    flex: 1,
    gap: 2,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "600",
  },
  orgRole: {
    fontSize: 14,
  },
});
