import { View, Text, Pressable, StyleSheet } from "react-native";
import { Users, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Avatar } from "@/components/ui/avatar";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { Member } from "@/types/organization";

interface OrgHubMembersCardProps {
  members: Member[];
}

export function OrgHubMembersCard({ members }: OrgHubMembersCardProps) {
  const scheme = useColorScheme();
  const router = useRouter();
  const previewMembers = members.slice(0, 3);

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/profile/admin/members")}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <GlassView style={styles.card}>
        <View style={styles.header}>
          <Users size={18} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
          <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
            Membres
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{members.length}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <ChevronRight
            size={18}
            color={semanticColors.labelTertiary[scheme]}
            strokeWidth={2}
          />
        </View>

        {previewMembers.length > 0 && (
          <View style={styles.avatarStack}>
            {previewMembers.map((m, i) => (
              <View key={m.id} style={[styles.avatarWrapper, { marginLeft: i > 0 ? -10 : 0 }]}>
                <Avatar
                  imageUrl={m.user?.image}
                  name={m.user?.name}
                  size={32}
                />
              </View>
            ))}
            {members.length > 3 && (
              <Text style={[styles.moreText, { color: semanticColors.labelSecondary[scheme] }]}>
                +{members.length - 3}
              </Text>
            )}
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.accentGreen,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moreText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
