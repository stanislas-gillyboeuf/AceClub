import { useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Text,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useConversation } from "@/hooks/use-conversation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { ChatBottomBar } from "@/features/chat/components/ChatBottomBar";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { useChat } from "@/features/chat/hooks/useChat";
import { wsManager } from "@/lib/websocket-manager";
import { authClient } from "@/lib/auth-client";
import type { ChatMessage, GroupPosition } from "@/features/chat/components/MessageBubble";
import type { Conversation } from "@/types/conversation";

function getDisplayName(conversation: Conversation): string {
  if (conversation.name) return conversation.name;
  return conversation.otherParticipants[0]?.user?.name ?? "Conversation";
}

function getAvatarUrl(conversation: Conversation): string | null {
  return conversation.otherParticipants[0]?.user?.image ?? null;
}

// Message grouping: same sender + < 60s apart
function getMessageGroupPosition(
  messages: ChatMessage[],
  index: number,
): GroupPosition {
  const message = messages[index];
  // FlatList is inverted: index 0 = newest, index+1 = older
  const newer = index > 0 ? messages[index - 1] : null;
  const older = index < messages.length - 1 ? messages[index + 1] : null;

  const isSameSenderAsNewer =
    newer &&
    newer.senderId === message.senderId &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(newer.createdAt).getTime()) < 60000;

  const isSameSenderAsOlder =
    older &&
    older.senderId === message.senderId &&
    Math.abs(new Date(message.createdAt).getTime() - new Date(older.createdAt).getTime()) < 60000;

  if (isSameSenderAsNewer && isSameSenderAsOlder) return "middle";
  if (isSameSenderAsNewer && !isSameSenderAsOlder) return "first";
  if (!isSameSenderAsNewer && isSameSenderAsOlder) return "last";
  return "single";
}

// Time separator: show when gap > 5 minutes between messages
function shouldShowTimeSeparator(
  messages: ChatMessage[],
  index: number,
): boolean {
  // FlatList is inverted: index+1 = older message
  const older = index < messages.length - 1 ? messages[index + 1] : null;
  if (!older) return true; // First message in history
  const diff = Math.abs(
    new Date(messages[index].createdAt).getTime() - new Date(older.createdAt).getTime(),
  );
  return diff > 300000; // 5 minutes
}

function formatTimeSeparator(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Aujourd'hui ${time}`;
  if (diffDays === 1) return `Hier ${time}`;
  if (diffDays < 7) {
    const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${time}`;
  }
  return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} ${time}`;
}

function formatDeliveryStatus(status: string): string {
  switch (status) {
    case "sending":
      return "Envoi…";
    case "sent":
      return "Envoyé";
    case "read":
      return "Lu";
    default:
      return "";
  }
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const scheme = useColorScheme();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";

  const { data: conversation, isLoading: isConversationLoading } = useConversation(conversationId);

  if (isConversationLoading || !conversation) {
    return (
      <View style={[styles.centered, { backgroundColor: semanticColors.chatBackground[scheme] }]}>
        <Stack.Screen options={{ title: "" }} />
        <ActivityIndicator color={colors.accentGreen} />
      </View>
    );
  }

  return <ChatContent conversation={conversation} currentUserId={currentUserId} />;
}

function ChatContent({
  conversation,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId: string;
}) {
  const scheme = useColorScheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isOtherUserTyping,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sendVoiceMessage,
    sendImageMessage,
    deleteMessage,
    retryFailedMessage,
    sendTypingIndicator,
    toggleMute,
    deleteConversation,
    errorMessage,
    setErrorMessage,
  } = useChat(conversation, currentUserId);

  // Load messages on mount and connect WS
  useEffect(() => {
    loadMessages();
    wsManager.connect();
  }, [loadMessages]);

  // Error alert
  useEffect(() => {
    if (errorMessage) {
      Alert.alert("Erreur", errorMessage, [{ text: "OK", onPress: () => setErrorMessage(null) }]);
    }
  }, [errorMessage, setErrorMessage]);

  const displayName = getDisplayName(conversation);
  const avatarUrl = getAvatarUrl(conversation);

  const handleProfilePress = useCallback(() => {
    Alert.alert(displayName, undefined, [
      {
        text: conversation.isMuted ? "Réactiver" : "Mettre en sourdine",
        onPress: toggleMute,
      },
      {
        text: "Supprimer la conversation",
        style: "destructive",
        onPress: () => {
          deleteConversation();
          router.back();
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  }, [displayName, conversation.isMuted, toggleMute, deleteConversation, router]);

  const handleSendText = useCallback(
    (text: string) => {
      sendMessage(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [sendMessage],
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const groupPosition = getMessageGroupPosition(messages, index);
      const showSeparator = shouldShowTimeSeparator(messages, index);

      // Delivery status: only under the newest outgoing message (index 0)
      const showDeliveryStatus =
        index === 0 && item.isFromMe && item.sendStatus !== "failed";

      return (
        <View>
          {showSeparator && (
            <Text style={[styles.timeSeparator, { color: semanticColors.labelSecondary[scheme] }]}>
              {formatTimeSeparator(item.createdAt)}
            </Text>
          )}
          <MessageBubble
            message={item}
            groupPosition={groupPosition}
            onRetry={() => retryFailedMessage(item)}
            onDelete={() => deleteMessage(item)}
          />
          {showDeliveryStatus && (
            <Text style={[styles.deliveryStatus, { color: semanticColors.labelSecondary[scheme] }]}>
              {formatDeliveryStatus(item.sendStatus)}
            </Text>
          )}
        </View>
      );
    },
    [messages, scheme, retryFailedMessage, deleteMessage],
  );

  const renderFooter = useCallback(() => {
    if (!hasMoreMessages || messages.length === 0) return null;
    return (
      <View style={styles.loadMore}>
        <ActivityIndicator color={colors.accentGreen} />
      </View>
    );
  }, [hasMoreMessages, messages.length]);

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.chatBackground[scheme] }]}>
      <Stack.Screen
        options={{
          headerBlurEffect: scheme === "dark" ? "systemMaterialDark" : "systemMaterial",
          headerTitle: () => (
            <Pressable onPress={handleProfilePress} style={styles.headerTitle}>
              <Avatar imageUrl={avatarUrl} name={displayName} size={28} />
              <Text
                style={[styles.headerName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        automaticallyAdjustsScrollIndicatorInsets
        automaticallyAdjustKeyboardInsets
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />

      {isOtherUserTyping && <TypingIndicator />}

      <ChatBottomBar
        onSendText={handleSendText}
        onSendVoice={sendVoiceMessage}
        onSendImage={sendImageMessage}
        onTyping={sendTypingIndicator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "600",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeSeparator: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    marginVertical: 12,
  },
  deliveryStatus: {
    textAlign: "right",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
    paddingRight: 4,
  },
  loadMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
