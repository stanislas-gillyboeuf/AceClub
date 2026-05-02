import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { Search, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMe, useSearchUsers } from "@/hooks/use-user";
import { useCreateMatchFormStore } from "@/store/create-match-form";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, semanticColors, radii } from "@/constants/theme";
import { StepProgress } from "./step-progress";
import { GhostForm } from "@/features/matches/components/create/ghost-form";
import { AddGhostButton } from "@/features/matches/components/create/add-ghost-button";
import { UserSearchResultRow } from "@/features/matches/components/create/user-search-result-row";
import type { UserSearchItem } from "@/types/user";

export default function Step2() {
  const scheme = useColorScheme();
  const { data: me } = useMe();
  const awayUser = useCreateMatchFormStore((s) => s.awayUser);
  const setAwayUser = useCreateMatchFormStore((s) => s.setAwayUser);

  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showGhostForm, setShowGhostForm] = useState(false);
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
          isGhost: user.isGhost,
        });
      }
    },
    [awayUser, setAwayUser],
  );

  const handleGhostCreated = useCallback(
    (user: UserSearchItem) => {
      setAwayUser(user);
      setShowGhostForm(false);
    },
    [setAwayUser],
  );

  const renderUser = useCallback(
    ({ item }: { item: UserSearchItem }) => (
      <UserSearchResultRow
        user={item}
        isSelected={awayUser?.id === item.id}
        onPress={() => handleSelect(item)}
        scheme={scheme}
      />
    ),
    [handleSelect, scheme, awayUser],
  );

  const showLoading = isLoading || isFetching;
  const hasQuery = debouncedQuery.length >= 2;

  const addGhostButton = <AddGhostButton onPress={() => setShowGhostForm(true)} scheme={scheme} />;

  if (showGhostForm) {
    return (
      <ScrollView
        style={[styles.list, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.ghostScrollContent}
      >
        <StepProgress />
        <GhostForm
          initialName={searchText.trim()}
          onCreated={handleGhostCreated}
          onBack={() => setShowGhostForm(false)}
          scheme={scheme}
        />
      </ScrollView>
    );
  }

  return (
    <FlatList
      style={[styles.list, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
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
      ListFooterComponent={hasQuery && results.length > 0 ? addGhostButton : null}
      ListEmptyComponent={
        showLoading && hasQuery ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accentGreen} />
          </View>
        ) : hasQuery && results.length === 0 ? (
          <View>
            <EmptyState
              icon="Users"
              title="Aucun joueur trouvé"
              description="Aucun joueur ne correspond à votre recherche."
            />
            {addGhostButton}
          </View>
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
  ghostScrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
    gap: 12,
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
