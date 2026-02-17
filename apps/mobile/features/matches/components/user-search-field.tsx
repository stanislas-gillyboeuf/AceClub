import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchUsers } from "@/hooks/use-user";
import { Avatar } from "@/components/ui/avatar";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";
import type { UserSearchItem } from "@/types/user";

interface UserSearchFieldProps {
  label: string;
  selectedUser: UserSearchItem | null;
  onSelect: (user: UserSearchItem | null) => void;
  excludedUserIds?: string[];
}

export function UserSearchField({
  label,
  selectedUser,
  onSelect,
  excludedUserIds = [],
}: UserSearchFieldProps) {
  const scheme = useColorScheme();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useSearchUsers(debouncedQuery, 10);

  const filteredUsers =
    data?.users.filter((u) => !excludedUserIds.includes(u.id)) ?? [];

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.length < 2) {
      setDebouncedQuery("");
      setShowResults(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setShowResults(true);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const handleSelect = useCallback(
    (user: UserSearchItem) => {
      onSelect(user);
      setQuery("");
      setDebouncedQuery("");
      setShowResults(false);
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    onSelect(null);
    setQuery("");
    setDebouncedQuery("");
    setShowResults(false);
  }, [onSelect]);

  if (selectedUser) {
    return (
      <View style={styles.selectedContainer}>
        <Text
          style={[
            styles.label,
            { color: semanticColors.labelSecondary[scheme] },
          ]}
        >
          {label}
        </Text>
        <View style={styles.selectedRow}>
          <Avatar
            imageUrl={selectedUser.image}
            name={selectedUser.name}
            size={36}
          />
          <View style={styles.selectedInfo}>
            <Text
              style={[
                styles.selectedName,
                { color: semanticColors.labelPrimary[scheme] },
              ]}
              numberOfLines={1}
            >
              {selectedUser.name}
            </Text>
            {selectedUser.isGhost && (
              <Text
                style={[
                  styles.ghostBadge,
                  { color: semanticColors.labelSecondary[scheme] },
                ]}
              >
                Invite
              </Text>
            )}
          </View>
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={20} color={colors.accentGreen} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: semanticColors.labelSecondary[scheme] },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor:
              scheme === "light" ? colors.gray100 : "#1C1C1E",
            borderColor: semanticColors.borderColor[scheme],
          },
        ]}
      >
        <Search
          size={16}
          color={semanticColors.labelSecondary[scheme]}
          strokeWidth={2}
        />
        <TextInput
          style={[
            styles.input,
            { color: semanticColors.labelPrimary[scheme] },
          ]}
          placeholder="Rechercher un joueur..."
          placeholderTextColor={semanticColors.labelSecondary[scheme]}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {isLoading && query.length >= 2 && (
          <ActivityIndicator size="small" color={colors.accentGreen} />
        )}
      </View>

      {showResults && filteredUsers.length > 0 && (
        <View
          style={[
            styles.resultsContainer,
            {
              backgroundColor: semanticColors.cardBackground[scheme],
              borderColor: semanticColors.borderColor[scheme],
            },
          ]}
        >
          {filteredUsers.map((user) => (
            <Pressable
              key={user.id}
              onPress={() => handleSelect(user)}
              style={({ pressed }) => [
                styles.resultRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Avatar imageUrl={user.image} name={user.name} size={32} />
              <Text
                style={[
                  styles.resultName,
                  { color: semanticColors.labelPrimary[scheme] },
                ]}
                numberOfLines={1}
              >
                {user.name}
              </Text>
              {user.isGhost && (
                <Text
                  style={[
                    styles.ghostBadge,
                    { color: semanticColors.labelSecondary[scheme] },
                  ]}
                >
                  Invite
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {showResults && !isLoading && filteredUsers.length === 0 && debouncedQuery.length >= 2 && (
        <Text
          style={[
            styles.noResults,
            { color: semanticColors.labelSecondary[scheme] },
          ]}
        >
          Aucun joueur trouve
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  selectedContainer: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  selectedInfo: {
    flex: 1,
    gap: 2,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: "500",
  },
  resultsContainer: {
    borderRadius: radii.sm,
    borderWidth: 0.5,
    overflow: "hidden",
    marginTop: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultName: {
    flex: 1,
    fontSize: 15,
  },
  ghostBadge: {
    fontSize: 11,
    fontStyle: "italic",
  },
  noResults: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
});
