import { View, Text, Pressable, StyleSheet, ActionSheetIOS, Platform, Alert } from "react-native";
import { MoreHorizontal } from "lucide-react-native";

import { Avatar } from "@/components/ui/avatar";
import { GlassView } from "@/components/ui/glass-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import {
  ROLE_LABELS,
  canActOnMember,
  getAssignableRoles,
} from "@/features/profile/lib/role-permissions";
import type { MemberRole } from "@/types/common";
import type { Member } from "@/types/organization";

const ROLE_COLORS: Record<MemberRole, string> = {
  owner: colors.accentOrange,
  admin: colors.accentGreen,
  member: colors.gray400,
};

interface ActionButton {
  text: string;
  onPress: () => void;
  isDestructive: boolean;
}

interface MemberRowProps {
  member: Member;
  actorRole: MemberRole;
  actorId: string;
  onChangeRole: (memberId: string, newRole: MemberRole, memberName: string) => void;
  onRemove: (memberId: string, memberName: string) => void;
}

export function MemberRow({
  member,
  actorRole,
  actorId,
  onChangeRole,
  onRemove,
}: MemberRowProps) {
  const scheme = useColorScheme();
  const targetRole = member.role;
  const targetId = member.userId;
  const memberName = member.user?.name ?? "Membre";

  const canAct = canActOnMember(actorRole, targetRole, actorId, targetId);
  const assignableRoles = canAct ? getAssignableRoles(actorRole, targetRole) : [];
  const canRemove = canAct && targetRole !== actorRole;
  const hasActions = assignableRoles.length > 0 || canRemove;

  const handleActions = () => {
    const buttons: ActionButton[] = [];

    for (const role of assignableRoles) {
      buttons.push({
        text: `Passer ${ROLE_LABELS[role]}`,
        onPress: () => onChangeRole(member.id, role, memberName),
        isDestructive: false,
      });
    }

    if (canRemove) {
      buttons.push({
        text: "Retirer du club",
        onPress: () => onRemove(member.id, memberName),
        isDestructive: true,
      });
    }

    if (Platform.OS === "ios") {
      const options = [...buttons.map((b) => b.text), "Annuler"];
      const destructiveIndex = buttons.findIndex((b) => b.isDestructive);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
        },
        (index) => {
          if (index < buttons.length) {
            buttons[index].onPress();
          }
        },
      );
    } else {
      Alert.alert(
        memberName,
        "Choisir une action",
        [
          ...buttons.map((btn) => ({
            text: btn.text,
            onPress: btn.onPress,
            style: (btn.isDestructive ? "destructive" : "default") as "destructive" | "default",
          })),
          { text: "Annuler", style: "cancel" as const },
        ],
      );
    }
  };

  const roleColor = ROLE_COLORS[targetRole];

  return (
    <GlassView style={styles.card}>
      <Avatar imageUrl={member.user?.image} name={member.user?.name} size={40} />

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
          numberOfLines={1}
        >
          {memberName}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20` }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>
            {ROLE_LABELS[targetRole]}
          </Text>
        </View>
      </View>

      {hasActions && (
        <Pressable onPress={handleActions} hitSlop={8}>
          <MoreHorizontal size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />
        </Pressable>
      )}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
