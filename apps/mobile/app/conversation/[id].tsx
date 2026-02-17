import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
  getMessageGroupPosition,
  shouldShowTimeSeparator,
  formatTimeSeparator,
  formatDeliveryStatus,
} from "@/features/chat/utils/message-helpers";
import { useChat } from "@/features/chat/hooks/useChat";
import { wsManager } from "@/lib/websocket-manager";
import { authClient } from "@/lib/auth-client";
import type { ChatMessage } from "@/features/chat/types";
import type { Conversation } from "@/types/conversation";

const HEADER_HEIGHT = 44;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
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
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [contextMenuMessage, setContextMenuMessage] = useState<ChatMessage | null>(null);
  const isNearBottom = useRef(true);
  const hasInitiallyScrolled = useRef(false);

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
  } = useChat(conversation, currentUserId);

  // Reverse messages: oldest first for non-inverted FlatList
  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  useEffect(() => {
    loadMessages();
    wsManager.connect();
  }, [loadMessages]);

  const [isListReady, setIsListReady] = useState(false);

  // Initial scroll to bottom — triggered when content is first laid out
  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    if (!hasInitiallyScrolled.current && reversedMessages.length > 0 && h > 0) {
      hasInitiallyScrolled.current = true;
      flatListRef.current?.scrollToEnd({ animated: false });
      // Reveal list after scroll command is dispatched
      requestAnimationFrame(() => setIsListReady(true));
    }
  }, [reversedMessages.length]);

  useEffect(() => {
    if (!hasInitiallyScrolled.current || reversedMessages.length === 0) return;
    if (isNearBottom.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [reversedMessages.length]);

  useEffect(() => {
    if (errorMessage) {
      Alert.alert("Erreur", errorMessage, [{ text: "OK", onPress: () => setErrorMessage(null) }]);
    }
  }, [errorMessage, setErrorMessage]);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      isNearBottom.current =
        contentOffset.y >= contentSize.height - layoutMeasurement.height - 100;

      if (contentOffset.y < 200 && hasMoreMessages) {
        loadMoreMessages();
      }
    },
    [hasMoreMessages, loadMoreMessages],
  );

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
      const groupPosition = getMessageGroupPosition(reversedMessages, index);
      const showSeparator = shouldShowTimeSeparator(reversedMessages, index);

      const showDeliveryStatus =
        index === reversedMessages.length - 1 && item.isFromMe && item.sendStatus !== "failed";

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
          />
          {showDeliveryStatus && (
            <Text style={[styles.deliveryStatus, { color: semanticColors.labelSecondary[scheme] }]}>
              {formatDeliveryStatus(item.sendStatus)}
            </Text>
          )}
        </View>
      );
    },
    [reversedMessages, scheme, retryFailedMessage, deleteMessage, setReplyingTo, toggleReaction],
  );

  const renderListHeader = useCallback(() => {
    if (!hasMoreMessages || reversedMessages.length === 0) return null;
    return (
      <View style={styles.loadMore}>
        <ActivityIndicator color={colors.accentGreen} />
      </View>
    );
  }, [hasMoreMessages, reversedMessages.length]);

  const topInset = insets.top + HEADER_HEIGHT;

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
        keyboardVerticalOffset={0}
      >
        <FlatList
          style={{ flex: 1, opacity: isListReady ? 1 : 0 }}
          contentInsetAdjustmentBehavior="never"
          ref={flatListRef}
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            { paddingTop: topInset, paddingBottom: 8 },
          ]}
          scrollIndicatorInsets={{ top: topInset }}
          ListHeaderComponent={renderListHeader}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
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
    flexGrow: 1,
    justifyContent: "flex-end" as const,
    paddingHorizontal: 16,
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
