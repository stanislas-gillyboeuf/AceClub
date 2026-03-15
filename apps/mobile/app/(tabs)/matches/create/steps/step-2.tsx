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
import { Search, X, Check, UserPlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMe, useSearchUsers, useCreateGhost } from "@/hooks/use-user";
import { useCreateMatchFormStore } from "@/store/create-match-form";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, semanticColors, radii } from "@/constants/theme";
import { StepProgress } from "./step-progress";
import type { UserSearchItem } from "@/types/user";

function GhostBadge() {
  return (
    <View style={styles.ghostBadge}>
      <Text style={styles.ghostBadgeText}>Externe</Text>
    </View>
  );
}

function GhostForm({
  initialName,
  onCreated,
  onBack,
  scheme,
}: {
  initialName: string;
  onCreated: (user: UserSearchItem) => void;
  onBack: () => void;
  scheme: "light" | "dark";
}) {
  const [ghostName, setGhostName] = useState(initialName);
  const [ghostEmail, setGhostEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createGhost = useCreateGhost();

  const canSubmit = ghostName.trim().length > 0 && ghostEmail.trim().includes("@");

  const handleSubmit = useCallback(() => {
    setError(null);
    createGhost.mutate(
      { name: ghostName.trim(), email: ghostEmail.trim() },
      {
        onSuccess: (ghost) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onCreated({
            id: ghost.id,
            name: ghost.name,
            image: ghost.image,
            isGhost: true,
          });
        },
        onError: (err: any) => {
          if (err?.status === 409) {
            setError("Un joueur avec cet email existe déjà.");
          } else {
            setError("Erreur lors de la création. Réessayez.");
          }
        },
      },
    );
  }, [ghostName, ghostEmail, createGhost, onCreated]);

  return (
    <View style={styles.ghostFormContainer}>
      <View style={styles.ghostInputGroup}>
        <Text style={[styles.ghostLabel, { color: semanticColors.labelSecondary[scheme] }]}>
          Nom
        </Text>
        <GlassView style={styles.ghostInputWrapper}>
          <TextInput
            style={[styles.ghostInput, { color: semanticColors.labelPrimary[scheme] }]}
            placeholder="Nom du joueur"
            placeholderTextColor={semanticColors.labelSecondary[scheme]}
            value={ghostName}
            onChangeText={setGhostName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </GlassView>
      </View>

      <View style={styles.ghostInputGroup}>
        <Text style={[styles.ghostLabel, { color: semanticColors.labelSecondary[scheme] }]}>
          Email
        </Text>
        <GlassView style={styles.ghostInputWrapper}>
          <TextInput
            style={[styles.ghostInput, { color: semanticColors.labelPrimary[scheme] }]}
            placeholder="email@exemple.com"
            placeholderTextColor={semanticColors.labelSecondary[scheme]}
            value={ghostEmail}
            onChangeText={(text) => {
              setGhostEmail(text);
              if (error) setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </GlassView>
      </View>

      {error && <Text style={styles.ghostError}>{error}</Text>}

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit || createGhost.isPending}
        style={({ pressed }) => [
          styles.ghostSubmitButton,
          !canSubmit && styles.ghostSubmitDisabled,
          pressed && canSubmit && { transform: [{ scale: 0.98 }] },
        ]}
      >
        {createGhost.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.ghostSubmitText}>Ajouter</Text>
        )}
      </Pressable>

      <Pressable onPress={onBack} style={styles.ghostBackButton} hitSlop={8}>
        <Text style={[styles.ghostBackText, { color: semanticColors.labelSecondary[scheme] }]}>
          Retour à la recherche
        </Text>
      </Pressable>
    </View>
  );
}

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
              <View style={styles.memberNameRow}>
                <Text
                  style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.isGhost && <GhostBadge />}
              </View>
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

  const addGhostButton = (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowGhostForm(true);
      }}
      style={({ pressed }) => [
        styles.memberRow,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <GlassView style={styles.memberCard} tintColor={`${colors.accentGreen}15`}>
        <View style={styles.ghostIcon}>
          <UserPlus size={22} color={colors.accentGreen} />
        </View>
        <View style={styles.memberInfo}>
          <Text
            style={[styles.memberName, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            Ajouter un joueur externe
          </Text>
          <Text
            style={[styles.ghostHint, { color: semanticColors.labelSecondary[scheme] }]}
            numberOfLines={1}
          >
            {"Joueur pas encore sur l'app"}
          </Text>
        </View>
      </GlassView>
    </Pressable>
  );

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
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "500",
    flexShrink: 1,
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
  // Ghost badge
  ghostBadge: {
    backgroundColor: `${colors.accentGreen}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ghostBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accentGreen,
  },
  // Ghost button in list
  ghostIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostHint: {
    fontSize: 14,
  },
  // Ghost form
  ghostScrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
    gap: 12,
  },
  ghostFormContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  ghostBackButton: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  ghostBackText: {
    fontSize: 15,
  },
  ghostInputGroup: {
    width: "100%",
    gap: 4,
  },
  ghostLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },
  ghostInputWrapper: {
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  ghostInput: {
    fontSize: 16,
    paddingVertical: 0,
  },
  ghostError: {
    fontSize: 13,
    color: colors.red500,
    textAlign: "center",
  },
  ghostSubmitButton: {
    backgroundColor: colors.accentGreen,
    borderRadius: radii.sm,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
  },
  ghostSubmitDisabled: {
    opacity: 0.5,
  },
  ghostSubmitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
