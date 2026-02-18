import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { Search, X, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMe, useSearchUsers } from "@/hooks/use-user";
import { useCreateMatchFormStore } from "@/store/create-match-form";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, semanticColors, radii } from "@/constants/theme";
import { StepProgress } from "./step-progress";
import type { UserSearchItem } from "@/types/user";

export default function Step2() {
  const scheme = useColorScheme();
  const { data: me } = useMe();
  const awayUser = useCreateMatchFormStore((s) => s.awayUser);
  const setAwayUser = useCreateMatchFormStore((s) => s.setAwayUser);

  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(searchText.trim());
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchText]);

  const { data: searchData, isLoading, isFetching } = useSearchUsers(debouncedQuery, 20);

  const results = useMemo(() => {
    if (!searchData?.users) return [];
    return searchData.users.filter((u) => u.id !== me?.id);
  }, [searchData, me?.id]);

  const handleSelect = useCallback(
    (user: UserSearchItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (awayUser?.id === user.id) {
        setAwayUser(null);
      } else {
        setAwayUser({
          id: user.id,
          name: user.name,
          image: user.image,
        });
      }
    },
    [awayUser, setAwayUser],
  );

  const renderUser = useCallback(
    ({ item }: { item: UserSearchItem }) => {
      const isSelected = awayUser?.id === item.id;

      return (
        <Pressable
          onPress={() => handleSelect(item)}
          style={({ pressed }) => [
            styles.memberRow,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <GlassView
            style={styles.memberCard}
            tintColor={isSelected ? `${colors.accentGreen}20` : undefined}
          >
            <Avatar imageUrl={item.image} name={item.name} size={46} />
            <View style={styles.memberInfo}>
              <Text
                style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.checkCircle}>
                <Check size={14} color="#fff" strokeWidth={3} />
              </View>
            )}
          </GlassView>
        </Pressable>
      );
    },
    [handleSelect, scheme, awayUser],
  );

  const showLoading = isLoading || isFetching;
  const hasQuery = debouncedQuery.length >= 2;

  return (
    <FlatList
      style={styles.list}
      data={hasQuery ? results : []}
      keyExtractor={(item) => item.id}
      renderItem={renderUser}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <StepProgress />
          <GlassView style={styles.searchBar}>
            <Search size={18} color={semanticColors.labelSecondary[scheme]} />
            <TextInput
              style={[styles.searchInput, { color: semanticColors.labelPrimary[scheme] }]}
              placeholder="Rechercher un joueur..."
              placeholderTextColor={semanticColors.labelSecondary[scheme]}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText("")} hitSlop={8}>
                <View
                  style={[
                    styles.clearButton,
                    { backgroundColor: semanticColors.labelSecondary[scheme] },
                  ]}
                >
                  <X size={12} color={semanticColors.primaryBackground[scheme]} strokeWidth={3} />
                </View>
              </Pressable>
            )}
          </GlassView>
        </View>
      }
      ListEmptyComponent={
        showLoading && hasQuery ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accentGreen} />
          </View>
        ) : hasQuery && results.length === 0 ? (
          <EmptyState
            icon="Users"
            title="Aucun joueur"
            description="Aucun joueur ne correspond à votre recherche."
          />
        ) : (
          <View style={styles.centered}>
            <Text style={[styles.hintText, { color: semanticColors.labelSecondary[scheme] }]}>
              Tapez au moins 2 caractères pour rechercher
            </Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    gap: 12,
  },
  headerContainer: {
    gap: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRow: {
    marginHorizontal: 16,
    borderRadius: radii.lg,
  },
  selectedLabel: {
    fontSize: 13,
  },
  memberRow: {
    marginHorizontal: 16,
    borderRadius: radii.lg,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radii.lg,
    gap: 14,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "500",
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  hintText: {
    fontSize: 15,
  },
});
