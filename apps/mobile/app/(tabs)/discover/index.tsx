import { useState, useEffect, useCallback, useRef } from "react";
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
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Check } from "lucide-react-native";
import { DiscoverCardStack } from "@/features/discover/components/discover-card-stack";
import { useDiscoverState } from "@/features/discover/hooks/use-discover-state";
import { useMatchRequests } from "@/hooks/use-match-intent";
import { useDiscoverDetailStore } from "@/store/discover-detail";
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

  const { setSelectedItem, consumeAction } = useDiscoverDetailStore();
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);

  // Use refs to avoid stale closures in useFocusEffect
  const likeRef = useRef(like);
  likeRef.current = like;
  const passRef = useRef(pass);
  passRef.current = pass;

  // Consume pending action (like/pass) when returning from detail screen
  useFocusEffect(
    useCallback(() => {
      const action = consumeAction();
      if (action === "like") likeRef.current();
      else if (action === "pass") passRef.current();
    }, [consumeAction])
  );

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
    router.push("/(tabs)/discover/detail");
  }, [setSelectedItem, router]);

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
                    <Pressable onPress={handleCreateIntent}>
                      <MaterialIcons name="add-circle-outline" size={24} color={colors.accentGreen} />
                    </Pressable>
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
            <Stack.Toolbar.Button onPress={handleCreateIntent} tintColor={colors.accentGreen}>
              <Stack.Toolbar.Icon sf="plus.circle" />
            </Stack.Toolbar.Button>
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
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        scrollEnabled={false}
        style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}
      >
        <GestureHandlerRootView>
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
        </GestureHandlerRootView>
      </ScrollView>

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
