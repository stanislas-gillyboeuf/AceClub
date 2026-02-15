import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Check, X } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import type { Invitation } from "@/types/invitation";

interface InvitationListProps {
  invitations: Invitation[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  loadingId?: string | null;
}

export function InvitationList({
  invitations,
  onAccept,
  onReject,
  loadingId,
}: InvitationListProps) {
  const scheme = useColorScheme();

  if (invitations.length === 0) return null;

  return (
    <Card>
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
        Invitations
      </Text>
      <View style={styles.list}>
        {invitations.map((invitation) => (
          <View
            key={invitation.id}
            style={[
              styles.row,
              { borderBottomColor: semanticColors.divider[scheme] },
            ]}
          >
            <View style={styles.info}>
              <Text
                style={[styles.orgName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {invitation.organizationName ?? "Club"}
              </Text>
              <Text style={[styles.role, { color: semanticColors.labelSecondary[scheme] }]}>
                {invitation.role === "admin" ? "Administrateur" : "Membre"}
              </Text>
            </View>
            {loadingId === invitation.id ? (
              <ActivityIndicator size="small" color={colors.accentGreen} />
            ) : (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => onAccept(invitation.id)}
                  style={[styles.actionButton, styles.acceptButton]}
                  hitSlop={4}
                >
                  <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  onPress={() => onReject(invitation.id)}
                  style={[styles.actionButton, styles.rejectButton]}
                  hitSlop={4}
                >
                  <X size={18} color="#ef4444" strokeWidth={2.5} />
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "500",
  },
  role: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: colors.accentGreen,
  },
  rejectButton: {
    backgroundColor: "#fef2f2",
  },
});
