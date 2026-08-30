import { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useConversation } from "@/hooks/use-conversation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { ChatBottomBar } from "@/features/chat/components/ChatBottomBar";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { MessageContextMenu } from "@/features/chat/components/MessageContextMenu";
import {
  getMessageGroupPositionInverted,
  shouldShowTimeSeparatorInverted,
  formatTimeSeparator,
  formatDeliveryStatus,
} from "@/features/chat/utils/message-helpers";
import { useChat } from "@/features/chat/hooks/useChat";
import { wsManager } from "@/lib/websocket-manager";
import { authClient } from "@/lib/auth-client";
import type { ChatMessage } from "@/features/chat/types";
import type { Conversation } from "@/types/conversation";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";

  const { data: conversation, isLoading: isConversationLoading } = useConversation(id);

  if (isConversationLoading || !conversation) {
    return (
      <View style={styles.centered}>
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
  const headerHeight = useHeaderHeight();
  const flatListRef = useRef<FlatList>(null);
  const [contextMenuMessage, setContextMenuMessage] = useState<ChatMessage | null>(null);
  const isLoadingMoreRef = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    replyingTo,
    setReplyingTo,
    clearReply,
    toggleReaction,
    updateMatchRequestStatus,
  } = useChat(conversation, currentUserId);

  useEffect(() => {
    loadMessages().finally(() => setIsInitialLoading(false));
    wsManager.connect();
  }, [loadMessages]);

  useEffect(() => {
    if (errorMessage) {
      Alert.alert("Erreur", errorMessage, [{ text: "OK", onPress: () => setErrorMessage(null) }]);
    }
  }, [errorMessage, setErrorMessage]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    try {
      await loadMoreMessages();
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [loadMoreMessages]);

  const handleSendText = useCallback(
    (text: string) => {
      sendMessage(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [sendMessage],
  );

  const handleContextMenuReply = useCallback(
    (msg: ChatMessage) => {
      setReplyingTo(msg);
    },
    [setReplyingTo],
  );

  const handleContextMenuDelete = useCallback(
    (msg: ChatMessage) => {
      deleteMessage(msg);
    },
    [deleteMessage],
  );

  const handleContextMenuReaction = useCallback(
    (messageId: string, emoji: string) => {
      toggleReaction(messageId, emoji);
    },
    [toggleReaction],
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const groupPosition = getMessageGroupPositionInverted(messages, index);
      const showSeparator = shouldShowTimeSeparatorInverted(messages, index);
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
            onLongPress={() => setContextMenuMessage(item)}
            onSwipeReply={() => setReplyingTo(item)}
            onToggleReaction={(emoji) => toggleReaction(item.id, emoji)}
            onRequestStatusChange={updateMatchRequestStatus}
          />
          {showDeliveryStatus && (
            <Text style={[styles.deliveryStatus, { color: semanticColors.labelSecondary[scheme] }]}>
              {formatDeliveryStatus(item.sendStatus)}
            </Text>
          )}
        </View>
      );
    },
    [messages, scheme, retryFailedMessage, deleteMessage, setReplyingTo, toggleReaction, updateMatchRequestStatus],
  );

  const renderLoadMore = useCallback(() => {
    if (!hasMoreMessages || messages.length === 0) return null;
    return (
      <View style={styles.loadMore}>
        <ActivityIndicator color={colors.accentGreen} />
      </View>
    );
  }, [hasMoreMessages, messages.length]);

  return (
    <View style={styles.container}>
      <ChatHeader
        conversation={conversation}
        onToggleMute={toggleMute}
        onDeleteConversation={deleteConversation}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        {isInitialLoading && (
          <View style={styles.messagesLoading}>
            <ActivityIndicator color={colors.accentGreen} />
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          removeClippedSubviews={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.messagesList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderLoadMore}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {isOtherUserTyping && <TypingIndicator />}

        <ChatBottomBar
          onSendText={handleSendText}
          onSendVoice={sendVoiceMessage}
          onSendImage={sendImageMessage}
          onTyping={sendTypingIndicator}
          replyingTo={replyingTo}
          onCancelReply={clearReply}
        />
      </KeyboardAvoidingView>

      <MessageContextMenu
        message={contextMenuMessage}
        visible={contextMenuMessage !== null}
        onClose={() => setContextMenuMessage(null)}
        onReply={handleContextMenuReply}
        onDelete={handleContextMenuDelete}
        onReaction={handleContextMenuReaction}
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
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
  messagesLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  loadMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
