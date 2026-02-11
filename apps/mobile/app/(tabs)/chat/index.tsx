import { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
} from "@/tw";
import {
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PenSquare, MessageCircle } from "lucide-react-native";
import { useConversations } from "@/hooks/useConversations";
import { ConversationRow } from "@/components/chat/ConversationRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChatListScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useConversations();

  const conversations = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
        edges={["top"]}
      >
        <View className="px-horizontal py-2">
          <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
            Conversations
          </Text>
        </View>
        <View className="px-horizontal gap-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Skeleton height={52} width={52} borderRadius={26} />
              <View className="flex-1 gap-2">
                <Skeleton height={16} width="60%" />
                <Skeleton height={14} width="80%" />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
          Conversations
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/chat/new")}
          hitSlop={8}
        >
          <PenSquare size={22} color="#34C759" />
        </Pressable>
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Aucune conversation"
          description="Vos conversations apparaîtront ici. Commencez un match ou contactez un joueur pour discuter."
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-[0.5px] bg-border/50 dark:bg-border-dark/50 ml-21 mr-horizontal" />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#34C759"
            />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
