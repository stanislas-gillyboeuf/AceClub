import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlassView } from "@/components/ui/glass-view";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { DiscoverCardStack } from "@/features/discover/components/discover-card-stack";
import { DiscoverDetailSheet } from "@/features/discover/components/discover-detail-sheet";
import { useDiscoverState } from "@/features/discover/hooks/use-discover-state";
import { useMatchRequests } from "@/hooks/use-match-intent";
import { colors, semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MatchIntentWithUser } from "@/types/match-intent";

const RADIUS_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "Tous", value: undefined },
];

export default function DiscoverScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const {
    items,
    isLoading,
    isSwiping,
    matchMessage,
    didMatch,
    isDiscoveryRestricted,
    selectedRadius,
    setSelectedRadius,
    like,
    pass,
    updateLocation,
  } = useDiscoverState();

  const { data: matchRequests } = useMatchRequests();
  const pendingCount = (matchRequests ?? []).filter((r) => r.status === "pending").length;

  const [selectedItem, setSelectedItem] = useState<MatchIntentWithUser | null>(null);
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

  const handleCardPress = useCallback((item: MatchIntentWithUser) => {
    setSelectedItem(item);
  }, []);

  const onOpenRequests = () => {
    router.push("/(tabs)/discover/requests");
  };

  const handleCreateIntent = useCallback(() => {
    router.push("/(tabs)/discover/create-intent");
  }, [router]);

  const handleRadiusSelect = useCallback(
    (value: number | undefined) => {
      setSelectedRadius(value);
      setShowRadiusMenu(false);
    },
    [setSelectedRadius]
  );

  if (isLoading && items.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
        <ActivityIndicator size="large" color={colors.accentGreen} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {!isDiscoveryRestricted && (
                      <Pressable onPress={() => setShowRadiusMenu(true)}>
                        <MaterialIcons name="tune" size={24} color={colors.accentGreen} />
                      </Pressable>
                    )}
                    <Pressable onPress={onOpenRequests} style={styles.headerButton}>
                      <MaterialIcons name="mail-outline" size={24} color={colors.accentGreen} />
                      {pendingCount > 0 && <View style={styles.badge} />}
                    </Pressable>
                  </View>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button onPress={onOpenRequests} tintColor={colors.accentGreen}>
              <Stack.Toolbar.Icon sf="envelope.badge" />
              {pendingCount > 0 && <Stack.Toolbar.Badge>{pendingCount}</Stack.Toolbar.Badge>}
            </Stack.Toolbar.Button>
          </Stack.Toolbar>
          {!isDiscoveryRestricted && (
            <Stack.Toolbar placement="left">
              <Stack.Toolbar.Menu
                icon="line.3.horizontal.decrease.circle"
                label={selectedRadius ? `${selectedRadius} km` : "Tous"}
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
        </>
      )}
      <GestureHandlerRootView
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          scrollEnabled={false}
          contentContainerStyle={{ flex: 1 }}
          style={{ flex: 1 }}
        >
        <DiscoverCardStack
          items={items}
          isLoading={isLoading}
          isSwiping={isSwiping}
          matchMessage={matchMessage}
          didMatch={didMatch}
          onLike={like}
          onPass={pass}
          onCardPress={handleCardPress}
          onCreateIntent={handleCreateIntent}
        />
        </ScrollView>

        <Modal
          visible={selectedItem !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedItem(null)}
        >
          {selectedItem && (
            <DiscoverDetailSheet
              item={selectedItem}
              onLike={() => {
                like();
                setSelectedItem(null);
              }}
              onPass={() => {
                pass();
                setSelectedItem(null);
              }}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </Modal>

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
                  style={[
                    styles.menuItem,
                    { borderBottomColor: semanticColors.borderColor[scheme] },
                  ]}
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
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  headerButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
});
