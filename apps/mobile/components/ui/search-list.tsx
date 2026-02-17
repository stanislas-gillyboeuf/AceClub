import { type ReactNode, useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { Search, X } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { EmptyState } from "@/components/ui/empty-state";

interface SearchListProps<T> {
  data: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  searchFilter: (item: T, query: string) => boolean;
  placeholder?: string;
  isLoading?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptySearchDescription?: string;
  ListHeaderComponent?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SearchList<T>({
  data,
  renderItem,
  keyExtractor,
  searchFilter,
  placeholder = "Rechercher",
  isLoading = false,
  emptyIcon = "Search",
  emptyTitle = "Aucun résultat",
  emptyDescription = "Aucun élément disponible.",
  emptySearchDescription = "Aucun résultat pour cette recherche.",
  ListHeaderComponent,
  style,
}: SearchListProps<T>) {
  const scheme = useColorScheme();
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    if (!searchText.trim()) return data;
    const query = searchText.toLowerCase();
    return data.filter((item) => searchFilter(item, query));
  }, [data, searchText, searchFilter]);

  const renderRow = useCallback(
    ({ item }: { item: T }) => <>{renderItem(item)}</>,
    [renderItem],
  );

  const renderSeparator = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: semanticColors.divider[scheme] }]}
      />
    ),
    [scheme],
  );

  return (
    <FlatList
      style={[styles.list, { backgroundColor: semanticColors.primaryBackground[scheme] }, style]}
      data={filtered}
      keyExtractor={keyExtractor}
      renderItem={renderRow}
      ItemSeparatorComponent={renderSeparator}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <GlassView style={styles.searchBar}>
            <Search size={18} color={semanticColors.labelSecondary[scheme]} />
            <TextInput
              style={[styles.searchInput, { color: semanticColors.labelPrimary[scheme] }]}
              placeholder={placeholder}
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
          {ListHeaderComponent}
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accentGreen} />
          </View>
        ) : (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={searchText ? emptySearchDescription : emptyDescription}
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  headerContainer: {
    gap: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
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
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 80,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
});
