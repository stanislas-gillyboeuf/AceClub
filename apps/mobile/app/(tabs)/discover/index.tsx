import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GlassView } from "@/components/ui/glass-view";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import { Check } from "lucide-react-native";
import { PartnerRequestCard } from "@/features/discover/components/PartnerRequestCard";
import { DiscoverFilters } from "@/features/discover/components/DiscoverFilters";
import { useDiscoverList } from "@/features/discover/hooks/use-discover-list";
import { EmptyState } from "@/components/ui/empty-state";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MatchIntentWithUser } from "@/types/match-intent";
import { MessagesHeaderButton } from "@/features/chat/components/MessagesHeaderButton";
import { MessagesToolbarButton } from "@/components/ui/messages-toolbar-button";

const RADIUS_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "Tous", value: undefined },
];

export default function DiscoverScreen() {
  const scheme = useColorScheme();
  const {
    items,
    sport,
    changeSport,
    selectedLevels,
    toggleLevel,
    isLoading,
    isRefreshing,
    isFetchingMore,
    hasMore,
    loadMore,
    isDiscoveryRestricted,
    selectedRadius,
    setSelectedRadius,
    updateLocation,
    refresh,
  } = useDiscoverList();

  const [showRadiusMenu, setShowRadiusMenu] = useState(false);

  useEffect(() => {
    if (isDiscoveryRestricted) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        updateLocation(location.coords.latitude, location.coords.longitude);
      } catch {
        // Location unavailable - continue without it
      }
    })();
  }, [isDiscoveryRestricted, updateLocation]);

  const handleRadiusSelect = useCallback(
    (value: number | undefined) => {
      setSelectedRadius(value);
      setShowRadiusMenu(false);
    },
    [setSelectedRadius]
  );

  const renderItem = useCallback(
    ({ item }: { item: MatchIntentWithUser }) => (
      <View style={styles.cardWrapper}>
        <PartnerRequestCard item={item} />
      </View>
    ),
    []
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Trouver un partenaire",
          headerLargeTitle: true,
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <View style={styles.androidHeaderRight}>
                    {!isDiscoveryRestricted && (
                      <Pressable onPress={() => setShowRadiusMenu(true)}>
                        <MaterialIcons name="tune" size={24} color={colors.accentGreen} />
                      </Pressable>
                    )}
                    <MessagesHeaderButton />
                  </View>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <>
          {!isDiscoveryRestricted && (
            <Stack.Toolbar placement="left">
              <Stack.Toolbar.Menu
                icon="line.3.horizontal.decrease.circle"
                title={selectedRadius ? `${selectedRadius} km` : "Tous"}
                tintColor={colors.accentGreen}
              >
                {RADIUS_OPTIONS.map((option) => (
                  <Stack.Toolbar.MenuAction
                    key={option.label}
                    icon={selectedRadius === option.value ? "checkmark" : undefined}
                    onPress={() => handleRadiusSelect(option.value)}
                  >
                    {option.label}
                  </Stack.Toolbar.MenuAction>
                ))}
              </Stack.Toolbar.Menu>
            </Stack.Toolbar>
          )}
          <Stack.Toolbar placement="right">
            <MessagesToolbarButton />
          </Stack.Toolbar>
        </>
      )}
      <FlatList
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={(item) => item.intent.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <DiscoverFilters
            sport={sport}
            onSportChange={changeSport}
            selectedLevels={selectedLevels}
            onToggleLevel={toggleLevel}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accentGreen} />
            </View>
          ) : (
            <EmptyState
              icon="UsersRound"
              title="Aucune recherche pour l'instant"
              description="Reviens plus tard ou crée ta propre recherche de partenaire."
            />
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        contentInsetAdjustmentBehavior="automatic"
      />

      <Modal
        visible={showRadiusMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRadiusMenu(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowRadiusMenu(false)}>
          <GlassView style={styles.menuContainer}>
            <Text style={[styles.menuTitle, { color: semanticColors.labelPrimary[scheme] }]}>
              Rayon de recherche
            </Text>
            {RADIUS_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                style={[styles.menuItem, { borderBottomColor: semanticColors.borderColor[scheme] }]}
                onPress={() => handleRadiusSelect(option.value)}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color:
                        selectedRadius === option.value
                          ? colors.accentGreen
                          : semanticColors.labelPrimary[scheme],
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {selectedRadius === option.value && (
                  <Check size={18} color={colors.accentGreen} strokeWidth={2.5} />
                )}
              </Pressable>
            ))}
          </GlassView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  androidHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardWrapper: {
    // spacing handled by ItemSeparatorComponent
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  menuContainer: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    fontSize: 16,
  },
});
