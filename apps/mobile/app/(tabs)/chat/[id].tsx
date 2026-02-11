import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
} from "@/tw";
import {
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Send } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { wsManager } from "@/lib/websocket";
import { useConversation, useMarkAsRead } from "@/hooks/useConversations";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Message } from "@/types/conversation";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? "";

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const conversation = useConversation(id);
  const messagesQuery = useMessages(id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const otherUser = conversation.data?.otherParticipants[0]?.user;

  // Flatten messages from all pages (newest first from API, we reverse for display)
  const allMessages = useMemo(() => {
    const msgs = messagesQuery.data?.pages.flatMap((p) => p) ?? [];
    return msgs;
  }, [messagesQuery.data]);

  // Mark as read on mount and when new messages arrive
  useEffect(() => {
    if (id && conversation.data && conversation.data.unreadCount > 0) {
      markAsRead.mutate(id);
    }
  }, [id, allMessages.length]);

  // Listen for WebSocket new_message events
  useEffect(() => {
    const unsubscribe = wsManager.on("new_message", (data: { message: Message }) => {
      if (data.message.conversationId === id) {
        // Invalidate messages to pick up the new message
        queryClient.invalidateQueries({
          queryKey: ["messages", id],
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        // Mark as read since user is in the chat
        markAsRead.mutate(id);
      }
    });

    return unsubscribe;
  }, [id, queryClient, markAsRead]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !id) return;

    const clientMessageId = `${currentUserId}-${Date.now()}`;

    setInputText("");
    sendMessage.mutate({
      conversationId: id,
      content: text,
      clientMessageId,
    });
  }, [inputText, id, currentUserId, sendMessage]);

  // Check if two consecutive messages are from the same sender
  const shouldShowAvatar = (index: number) => {
    if (index === allMessages.length - 1) return true;
    const current = allMessages[index];
    const next = allMessages[index + 1];
    return current.sender.id !== next?.sender.id;
  };

  if (conversation.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark">
        <View className="flex-row items-center gap-3 px-horizontal py-2">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color="#34C759" />
          </Pressable>
          <Skeleton height={40} width={40} borderRadius={20} />
          <Skeleton height={18} width="40%" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-horizontal py-2 border-b-[0.5px] border-border/50 dark:border-border-dark/50">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="flex-row items-center gap-1"
          >
            <ChevronLeft size={24} color="#34C759" />
          </Pressable>
          <Avatar
            imageUrl={otherUser?.image}
            name={otherUser?.name ?? "?"}
            size={36}
          />
          <View className="flex-1">
            <Text className="text-base font-sans-semibold text-label-primary dark:text-label-primary-dark">
              {otherUser?.name ?? "Conversation"}
            </Text>
            {otherUser?.level != null && (
              <Text className="text-xs font-sans text-label-secondary">
                Niveau {otherUser.level}
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MessageBubble
              message={item}
              showAvatar={shouldShowAvatar(index)}
            />
          )}
          inverted
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
          onEndReached={() => {
            if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
              messagesQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            messagesQuery.isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#34C759" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            messagesQuery.isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#34C759" />
              </View>
            ) : (
              <View className="py-16 items-center">
                <Text className="text-sm font-sans text-label-secondary text-center">
                  Aucun message.{"\n"}Commencez la conversation !
                </Text>
              </View>
            )
          }
        />

        {/* Input bar */}
        <View className="flex-row items-end gap-2 px-horizontal py-2 border-t-[0.5px] border-border/50 dark:border-border-dark/50 bg-bg-primary dark:bg-bg-primary-dark">
          <View className="flex-1 flex-row items-end bg-bg-input dark:bg-bg-input-dark rounded-[20px] px-4 min-h-10 max-h-30">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#8E8E93"
              className="flex-1 text-[15px] font-sans text-label-primary dark:text-label-primary-dark py-2.5"
              multiline
              maxLength={2000}
              returnKeyType="default"
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sendMessage.isPending}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              inputText.trim()
                ? "bg-primary dark:bg-primary-dark"
                : "bg-border/30 dark:bg-border-dark/30"
            }`}
          >
            {sendMessage.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send
                size={18}
                color={inputText.trim() ? "#FFFFFF" : "#8E8E93"}
                style={{ marginLeft: 2 }}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
