import { useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
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
import { ChevronRight } from "lucide-react-native";
import type { ChatMessage } from "@/features/chat/components/MessageBubble";
import type { Conversation } from "@/types/conversation";

function getDisplayName(conversation: Conversation): string {
  if (conversation.name) return conversation.name;
  return conversation.otherParticipants[0]?.user?.name ?? "Conversation";
}

function getAvatarUrl(conversation: Conversation): string | null {
  return conversation.otherParticipants[0]?.user?.image ?? null;
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const scheme = useColorScheme();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";

  const { data: conversation, isLoading: isConversationLoading } = useConversation(conversationId);

  if (isConversationLoading || !conversation) {
    return (
      <View style={[styles.centered, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
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
    isLoading,
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

  const shouldShowTime = useCallback(
    (message: ChatMessage, index: number): boolean => {
      if (index === 0) return true;
      const next = messages[index - 1];
      if (!next) return true;
      const diff = new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime();
      return Math.abs(diff) > 300000; // 5 minutes
    },
    [messages],
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <MessageBubble
        message={item}
        showTime={shouldShowTime(item, index)}
        onRetry={() => retryFailedMessage(item)}
        onDelete={() => deleteMessage(item)}
      />
    ),
    [shouldShowTime, retryFailedMessage, deleteMessage],
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable onPress={handleProfilePress} style={styles.headerTitle}>
              <Avatar imageUrl={avatarUrl} name={displayName} size={32} />
              <View>
                <Text
                  style={[styles.headerName, { color: semanticColors.labelPrimary[scheme] }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {!wsManager.isConnected && (
                  <Text style={[styles.headerStatus, { color: semanticColors.labelTertiary[scheme] }]}>
                    {wsManager.connectionState === "reconnecting" ? "Reconnexion..." : "Hors ligne"}
                  </Text>
                )}
              </View>
              <ChevronRight size={14} color={semanticColors.labelSecondary[scheme]} />
            </Pressable>
          ),
          headerBackTitle: "Messages",
        }}
      />

      <FlatList
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
        onSendText={sendMessage}
        onSendVoice={sendVoiceMessage}
        onSendImage={sendImageMessage}
        onTyping={sendTypingIndicator}
      />
    </KeyboardAvoidingView>
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
  headerStatus: {
    fontSize: 11,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
