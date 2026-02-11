import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
} from "@/tw";
import {
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  Search,
  MapPin,
  Inbox,
  ChevronDown,
  AlertTriangle,
} from "lucide-react-native";
import { DiscoverCard } from "@/components/discover/DiscoverCard";
import { RequestCard } from "@/components/discover/RequestCard";
import type { MatchIntentDiscoverItem, MatchRequestWithDetails } from "@/types/match-intent";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useDiscoverIntents,
  useSwipeIntent,
  useReceivedRequests,
  useAcceptRequest,
  useRejectRequest,
} from "@/hooks/useMatchIntents";

type Tab = "discover" | "requests";

const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function DiscoverScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [radius, setRadius] = useState(25);
  const [showRadiusPicker, setShowRadiusPicker] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("La localisation est nécessaire pour découvrir des joueurs à proximité.");
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        setLocationError("Impossible d'obtenir votre position.");
      }
    })();
  }, []);

  const discoverQuery = useDiscoverIntents({
    latitude: location?.latitude,
    longitude: location?.longitude,
    radius,
  });

  const swipeIntent = useSwipeIntent();
  const receivedRequests = useReceivedRequests();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  // Flatten all pages of discover items
  const discoverItems = useMemo(
    () => discoverQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [discoverQuery.data]
  );

  const isDiscoveryRestricted =
    discoverQuery.data?.pages[0]?.isDiscoveryRestricted ?? false;

  // Track swiped item IDs to remove from stack
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  const visibleItems = useMemo(
    () => discoverItems.filter((item) => !swipedIds.has(item.id)),
    [discoverItems, swipedIds]
  );

  // When running low on cards, fetch more
  useEffect(() => {
    if (
      visibleItems.length < 3 &&
      discoverQuery.hasNextPage &&
      !discoverQuery.isFetchingNextPage
    ) {
      discoverQuery.fetchNextPage();
    }
  }, [visibleItems.length, discoverQuery.hasNextPage, discoverQuery.isFetchingNextPage]);

  const handleSwipe = useCallback(
    (itemId: string, action: "like" | "pass") => {
      setSwipedIds((prev) => new Set(prev).add(itemId));
      swipeIntent.mutate(
        { matchIntentId: itemId, action },
        {
          onSuccess: (result) => {
            if (action === "like" && result.request) {
              // Could show a toast here
            }
          },
        }
      );
    },
    [swipeIntent]
  );

  const handleAcceptRequest = useCallback(
    (requestId: string) => {
      acceptRequest.mutate(requestId, {
        onSuccess: (data) => {
          if (data.match) {
            Alert.alert(
              "Match créé !",
              `Un match a été créé avec ${data.requester?.name ?? "le joueur"}. Vous pouvez discuter dans le chat.`,
              [
                { text: "Voir le match", onPress: () => router.push(`/(tabs)/matches/${data.match.id}`) },
                { text: "OK" },
              ]
            );
          }
        },
      });
    },
    [acceptRequest, router]
  );

  const handleRejectRequest = useCallback(
    (requestId: string) => {
      rejectRequest.mutate(requestId);
    },
    [rejectRequest]
  );

  const pendingRequests = useMemo(
    () => (receivedRequests.data ?? []).filter((r) => r.status === "pending"),
    [receivedRequests.data]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="px-horizontal py-2">
        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
          Découvrir
        </Text>
      </View>

      {/* Tab switcher */}
      <View className="flex-row mx-horizontal mb-3 bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark overflow-hidden">
        <Pressable
          onPress={() => setActiveTab("discover")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 ${
            activeTab === "discover"
              ? "bg-primary/10 dark:bg-primary-dark/10"
              : ""
          }`}
        >
          <Search
            size={16}
            color={activeTab === "discover" ? "#34C759" : "#8E8E93"}
          />
          <Text
            className={`text-sm font-sans-medium ${
              activeTab === "discover"
                ? "text-primary dark:text-primary-dark"
                : "text-label-secondary"
            }`}
          >
            Explorer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("requests")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 ${
            activeTab === "requests"
              ? "bg-primary/10 dark:bg-primary-dark/10"
              : ""
          }`}
        >
          <Inbox
            size={16}
            color={activeTab === "requests" ? "#34C759" : "#8E8E93"}
          />
          <Text
            className={`text-sm font-sans-medium ${
              activeTab === "requests"
                ? "text-primary dark:text-primary-dark"
                : "text-label-secondary"
            }`}
          >
            Demandes
          </Text>
          {pendingRequests.length > 0 && (
            <View className="bg-destructive dark:bg-destructive-dark rounded-full min-w-4.5 h-4.5 items-center justify-center px-1">
              <Text className="text-white text-[11px] font-sans-bold">
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {activeTab === "discover" ? (
        <DiscoverTab
          items={visibleItems}
          isLoading={discoverQuery.isLoading}
          locationError={locationError}
          isDiscoveryRestricted={isDiscoveryRestricted}
          radius={radius}
          showRadiusPicker={showRadiusPicker}
          onToggleRadiusPicker={() => setShowRadiusPicker(!showRadiusPicker)}
          onSetRadius={(r) => {
            setRadius(r);
            setShowRadiusPicker(false);
            setSwipedIds(new Set());
          }}
          onSwipe={handleSwipe}
        />
      ) : (
        <RequestsTab
          requests={receivedRequests.data ?? []}
          isLoading={receivedRequests.isLoading}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          acceptingId={
            acceptRequest.isPending
              ? (acceptRequest.variables as string)
              : null
          }
          rejectingId={
            rejectRequest.isPending
              ? (rejectRequest.variables as string)
              : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function DiscoverTab({
  items,
  isLoading,
  locationError,
  isDiscoveryRestricted,
  radius,
  showRadiusPicker,
  onToggleRadiusPicker,
  onSetRadius,
  onSwipe,
}: {
  items: MatchIntentDiscoverItem[];
  isLoading: boolean;
  locationError: string | null;
  isDiscoveryRestricted: boolean;
  radius: number;
  showRadiusPicker: boolean;
  onToggleRadiusPicker: () => void;
  onSetRadius: (r: number) => void;
  onSwipe: (id: string, action: "like" | "pass") => void;
}) {
  if (locationError) {
    return (
      <EmptyState
        icon={MapPin}
        title="Localisation requise"
        description={locationError}
      />
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 px-horizontal pt-4 gap-4">
        <Skeleton height={400} borderRadius={16} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Radius filter */}
      <View className="px-horizontal mb-3">
        <View className="flex-row items-center gap-2">
          <MapPin size={14} color="#8E8E93" />
          <Pressable
            onPress={onToggleRadiusPicker}
            className="flex-row items-center gap-1"
          >
            <Text className="text-sm font-sans-medium text-label-secondary">
              Rayon : {radius} km
            </Text>
            <ChevronDown size={14} color="#8E8E93" />
          </Pressable>

          {isDiscoveryRestricted && (
            <View className="flex-row items-center gap-1 ml-auto">
              <AlertTriangle size={12} color="#FF9500" />
              <Text className="text-xs font-sans text-accent-orange dark:text-accent-orange-dark">
                Club uniquement
              </Text>
            </View>
          )}
        </View>

        {showRadiusPicker && (
          <View className="flex-row gap-2 mt-2">
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => onSetRadius(r)}
                className={`px-3 py-1.5 rounded-full border-[0.5px] ${
                  radius === r
                    ? "bg-primary/10 dark:bg-primary-dark/10 border-primary dark:border-primary-dark"
                    : "bg-bg-card dark:bg-bg-card-dark border-border dark:border-border-dark"
                }`}
              >
                <Text
                  className={`text-sm font-sans-medium ${
                    radius === r
                      ? "text-primary dark:text-primary-dark"
                      : "text-label-primary dark:text-label-primary-dark"
                  }`}
                >
                  {r} km
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Card stack */}
      {items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucune proposition"
          description="Il n'y a pas de joueurs à proximité pour le moment. Revenez plus tard ou augmentez le rayon de recherche."
        />
      ) : (
        <View className="flex-1 relative">
            {/* Render top 2 cards, bottom first so top is on top */}
            {items
              .slice(0, 2)
              .reverse()
              .map((item, idx) => (
                <DiscoverCard
                  key={item.id}
                  item={item}
                  isTop={idx === 1}
                  onSwipe={(action) => onSwipe(item.id, action)}
                />
              ))}
          </View>
      )}
    </View>
  );
}

function RequestsTab({
  requests,
  isLoading,
  onAccept,
  onReject,
  acceptingId,
  rejectingId,
}: {
  requests: MatchRequestWithDetails[];
  isLoading: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  acceptingId: string | null;
  rejectingId: string | null;
}) {
  if (isLoading) {
    return (
      <View className="flex-1 px-horizontal pt-4 gap-3">
        <Skeleton height={120} borderRadius={12} />
        <Skeleton height={120} borderRadius={12} />
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune demande"
        description="Les demandes de match que vous recevez apparaîtront ici."
      />
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
      renderItem={({ item }) => (
        <RequestCard
          request={item}
          onAccept={onAccept}
          onReject={onReject}
          isAccepting={acceptingId === item.id}
          isRejecting={rejectingId === item.id}
        />
      )}
    />
  );
}
