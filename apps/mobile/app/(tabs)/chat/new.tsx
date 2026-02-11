import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
} from "@/tw";
import {
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { useFindOrCreateConversation } from "@/hooks/useConversations";
import { useSearchUsers } from "@/hooks/useUser";
import { Avatar } from "@/components/ui/Avatar";

export default function NewChatScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const searchUsers = useSearchUsers();
  const findOrCreate = useFindOrCreateConversation();

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.length >= 2) {
        searchUsers.mutate(query);
      }
    },
    [searchUsers]
  );

  const handleSelectUser = useCallback(
    (userId: string) => {
      findOrCreate.mutate(userId, {
        onSuccess: (result) => {
          router.replace(`/(tabs)/chat/${result.conversationId}`);
        },
      });
    },
    [findOrCreate, router]
  );

  const filteredResults = (searchUsers.data ?? []).filter(
    (u) => u.id !== currentUserId
  );

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={24} color="#34C759" />
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>
        <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
          Nouvelle conversation
        </Text>
        <View className="w-16" />
      </View>

      <View className="px-horizontal pt-4 gap-4">
        {/* Search input */}
        <View className="flex-row items-center gap-2 bg-bg-input dark:bg-bg-input-dark rounded-[10px] px-3.5">
          <Search size={18} color="#8E8E93" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Rechercher un joueur..."
            placeholderTextColor="#8E8E93"
            className="flex-1 text-label-primary dark:text-label-primary-dark font-sans text-base py-3.5"
            autoCorrect={false}
            autoFocus
          />
          {searchUsers.isPending && (
            <ActivityIndicator size="small" color="#34C759" />
          )}
        </View>

        {/* Results */}
        {searchQuery.length >= 2 && (
          <>
            {filteredResults.length === 0 && !searchUsers.isPending && (
              <View className="py-8 items-center">
                <Text className="text-sm font-sans text-label-secondary">
                  Aucun joueur trouvé
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {searchQuery.length >= 2 && filteredResults.length > 0 && (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectUser(item.id)}
              disabled={findOrCreate.isPending}
              className="flex-row items-center gap-3 px-horizontal py-3"
            >
              <Avatar
                imageUrl={item.image}
                name={item.name}
                size={44}
              />
              <View className="flex-1">
                <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                  {item.name}
                </Text>
                {item.isGhost && (
                  <Text className="text-sm font-sans text-label-secondary">
                    Joueur fantôme
                  </Text>
                )}
              </View>
              {findOrCreate.isPending &&
                findOrCreate.variables === item.id && (
                  <ActivityIndicator size="small" color="#34C759" />
                )}
            </Pressable>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-[0.5px] bg-border/50 dark:bg-border-dark/50 ml-19 mr-horizontal" />
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
