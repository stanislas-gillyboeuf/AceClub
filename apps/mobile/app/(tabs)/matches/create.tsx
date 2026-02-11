import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
} from "@/tw";
import {
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Search, X, UserPlus } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { useCreateMatch } from "@/hooks/useMatches";
import { useSearchUsers } from "@/hooks/useUser";
import { Avatar } from "@/components/ui/Avatar";
import type { SearchUserResult } from "@/types/user";
import type { MatchType, MatchStatus } from "@/types/match";

export default function CreateMatchScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<SearchUserResult | null>(null);
  const [matchType, setMatchType] = useState<MatchType>("match");
  const [startNow, setStartNow] = useState(true);

  const createMatch = useCreateMatch();
  const searchUsers = useSearchUsers();

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.length >= 2) {
        searchUsers.mutate(query);
      }
    },
    [searchUsers]
  );

  const handleSelectOpponent = useCallback((opponent: SearchUserResult) => {
    setSelectedOpponent(opponent);
    setSearchQuery("");
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedOpponent || !currentUserId) return;

    const now = new Date().toISOString();
    const status: MatchStatus = startNow ? "ongoing" : "scheduled";

    createMatch.mutate(
      {
        createdBy: currentUserId,
        status,
        type: matchType,
        createdAt: now,
        startedAt: startNow ? now : undefined,
        participants: [
          { userId: currentUserId, side: "home" },
          { userId: selectedOpponent.id, side: "away" },
        ],
        sets: [],
      },
      {
        onSuccess: (data) => {
          router.replace(`/(tabs)/matches/${data.match?.id ?? data}`);
        },
        onError: (error) => {
          Alert.alert("Erreur", "Impossible de créer le match");
        },
      }
    );
  }, [selectedOpponent, currentUserId, matchType, startNow, createMatch, router]);

  const filteredResults = (searchUsers.data ?? []).filter(
    (u) => u.id !== currentUserId
  );

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
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
            Nouveau match
          </Text>
          <View className="w-16" />
        </View>

        <View className="flex-1 px-horizontal gap-4 pt-4">
          {/* Opponent selection */}
          <View className="gap-2">
            <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide">
              Adversaire
            </Text>

            {selectedOpponent ? (
              <View className="flex-row items-center justify-between p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark">
                <View className="flex-row items-center gap-3">
                  <Avatar
                    imageUrl={selectedOpponent.image}
                    name={selectedOpponent.name}
                    size={40}
                  />
                  <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                    {selectedOpponent.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSelectedOpponent(null)}
                  hitSlop={8}
                >
                  <X size={18} color="#8E8E93" />
                </Pressable>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 bg-bg-input dark:bg-bg-input-dark rounded-[10px] px-3.5">
                <Search size={18} color="#8E8E93" />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Rechercher un joueur..."
                  placeholderTextColor="#8E8E93"
                  className="flex-1 text-label-primary dark:text-label-primary-dark font-sans text-base py-3.5"
                  autoCorrect={false}
                />
                {searchUsers.isPending && (
                  <ActivityIndicator size="small" color="#34C759" />
                )}
              </View>
            )}

            {/* Search results */}
            {!selectedOpponent && searchQuery.length >= 2 && (
              <View className="bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark max-h-48 overflow-hidden">
                {filteredResults.length === 0 && !searchUsers.isPending && (
                  <View className="py-4 items-center">
                    <Text className="text-sm font-sans text-label-secondary">
                      Aucun joueur trouvé
                    </Text>
                  </View>
                )}
                <FlatList
                  data={filteredResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleSelectOpponent(item)}
                      className="flex-row items-center gap-3 px-card py-3 border-b border-border/50 dark:border-border-dark/50"
                    >
                      <Avatar
                        imageUrl={item.image}
                        name={item.name}
                        size={36}
                      />
                      <Text className="text-sm font-sans text-label-primary dark:text-label-primary-dark">
                        {item.name}
                      </Text>
                    </Pressable>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}
          </View>

          {/* Match type */}
          <View className="gap-2">
            <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide">
              Type
            </Text>
            <View className="flex-row gap-3">
              {(
                [
                  { value: "match", label: "Match" },
                  { value: "training", label: "Entraînement" },
                ] as const
              ).map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setMatchType(option.value)}
                  className={`flex-1 py-3 rounded-md items-center border-[0.5px] ${
                    matchType === option.value
                      ? "bg-primary/10 dark:bg-primary-dark/10 border-primary dark:border-primary-dark"
                      : "bg-bg-card dark:bg-bg-card-dark border-border dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-sm font-sans-medium ${
                      matchType === option.value
                        ? "text-primary dark:text-primary-dark"
                        : "text-label-primary dark:text-label-primary-dark"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Start now toggle */}
          <View className="gap-2">
            <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide">
              Quand
            </Text>
            <View className="flex-row gap-3">
              {(
                [
                  { value: true, label: "Maintenant" },
                  { value: false, label: "Plus tard" },
                ] as const
              ).map((option) => (
                <Pressable
                  key={String(option.value)}
                  onPress={() => setStartNow(option.value)}
                  className={`flex-1 py-3 rounded-md items-center border-[0.5px] ${
                    startNow === option.value
                      ? "bg-primary/10 dark:bg-primary-dark/10 border-primary dark:border-primary-dark"
                      : "bg-bg-card dark:bg-bg-card-dark border-border dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-sm font-sans-medium ${
                      startNow === option.value
                        ? "text-primary dark:text-primary-dark"
                        : "text-label-primary dark:text-label-primary-dark"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="flex-1" />

          {/* Create button */}
          <Pressable
            onPress={handleCreate}
            disabled={!selectedOpponent || createMatch.isPending}
            className={`flex-row items-center justify-center gap-2 rounded-sm h-button mb-4 ${
              selectedOpponent
                ? "bg-primary dark:bg-primary-dark"
                : "bg-border/30 dark:bg-border-dark/30"
            }`}
          >
            {createMatch.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <UserPlus size={18} color="#FFFFFF" />
                <Text
                  className={`font-sans-semibold text-base ${
                    selectedOpponent
                      ? "text-white"
                      : "text-label-tertiary dark:text-label-tertiary-dark"
                  }`}
                >
                  Créer le match
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
