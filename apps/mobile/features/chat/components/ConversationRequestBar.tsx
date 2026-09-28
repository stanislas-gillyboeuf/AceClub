import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Button from "@/components/ui/button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import {
  useAcceptConversationRequest,
  useRejectConversationRequest,
} from "@/hooks/use-conversation";
import type { Conversation } from "@/types/conversation";

interface ConversationRequestBarProps {
  conversation: Conversation;
  currentUserId: string;
}

/** Replaces the chat input while a fresh direct conversation is a "pending_request": the
 * recipient sees Accept/Reject, the initiator (who already sent their one allowed message) sees
 * a waiting notice instead of a text field that would just fail server-side. */
export function ConversationRequestBar({
  conversation,
  currentUserId,
}: ConversationRequestBarProps) {
  const scheme = useColorScheme();
  const acceptRequest = useAcceptConversationRequest();
  const rejectRequest = useRejectConversationRequest();

  const isInitiator = conversation.initiatedByUserId === currentUserId;
  const otherName = conversation.otherParticipants[0]?.user?.name ?? "Ce joueur";

  if (isInitiator) {
    return (
      <View style={[styles.container, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
        <Text style={[styles.waitingText, { color: semanticColors.labelSecondary[scheme] }]}>
          En attente de réponse de {otherName}
        </Text>
      </View>
    );
  }

  const isPending = acceptRequest.isPending || rejectRequest.isPending;

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.cardBackground[scheme] }]}>
      <Text style={[styles.promptText, { color: semanticColors.labelPrimary[scheme] }]}>
        {otherName} souhaite vous contacter
      </Text>
      {isPending ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.actionsRow}>
          <Button
            label="Refuser"
            variant="secondary"
            style={styles.actionButton}
            onPress={() => rejectRequest.mutate(conversation.id)}
          />
          <Button
            label="Accepter"
            variant="primary"
            style={styles.actionButton}
            onPress={() => acceptRequest.mutate(conversation.id)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  waitingText: {
    fontSize: 14,
    textAlign: "center",
  },
  promptText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
