import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useDiscover, useSwipe } from "@/hooks/use-match-intent";
import type { MatchIntentWithUser } from "@/types/match-intent";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
}

export function useDiscoverState() {
  const [items, setItems] = useState<MatchIntentWithUser[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [didMatch, setDidMatch] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<LocationState>({ latitude: null, longitude: null });
  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(true);

  const swipeMutation = useSwipe();

  // Stabilize params object to avoid unnecessary query key changes
  const queryParams = useMemo(
    () => ({
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
      radius: selectedRadius,
      limit: 20,
    }),
    [location.latitude, location.longitude, selectedRadius]
  );

  const discoverQuery = useDiscover(queryParams);

  // isDiscoveryRestricted is read-only from the API — the server handles the flag
  const isDiscoveryRestricted = discoverQuery.data?.isDiscoveryRestricted ?? false;

  // Sync query results into local items state
  useEffect(() => {
    if (discoverQuery.data) {
      setItems(discoverQuery.data.data);
      cursorRef.current = discoverQuery.data.pagination.nextCursor ?? undefined;
      hasMoreRef.current = discoverQuery.data.pagination.hasMore;
    }
  }, [discoverQuery.data]);

  const topCard = items.length > 0 ? items[0] : null;

  const removeTopCard = useCallback(() => {
    setItems((prev) => prev.slice(1));
    setMatchMessage(null);
    setDidMatch(false);
  }, []);

  const performSwipe = useCallback(
    async (action: "like" | "pass") => {
      if (!topCard || isSwiping) return;
      setIsSwiping(true);
      setMatchMessage(null);
      setDidMatch(false);

      const swipeStart = Date.now();

      try {
        const result = await swipeMutation.mutateAsync({
          matchIntentId: topCard.intent.id,
          action,
        });
        setMatchMessage(result.message ?? null);
        setDidMatch(result.matchRequest != null);
      } catch {
        // Swipe failed - still remove card
      }

      // Wait for swipe-out animation to finish (200ms) before removing the card
      const elapsed = Date.now() - swipeStart;
      const remaining = 250 - elapsed;
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      removeTopCard();
      setIsSwiping(false);
    },
    [topCard, isSwiping, swipeMutation, removeTopCard]
  );

  const like = useCallback(() => performSwipe("like"), [performSwipe]);
  const pass = useCallback(() => performSwipe("pass"), [performSwipe]);

  const updateLocation = useCallback((lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
  }, []);

  const refetchRef = useRef(discoverQuery.refetch);
  refetchRef.current = discoverQuery.refetch;

  const refresh = useCallback(async () => {
    await refetchRef.current();
  }, []);

  return {
    items,
    isLoading: discoverQuery.isLoading,
    isSwiping,
    matchMessage,
    didMatch,
    isDiscoveryRestricted,
    selectedRadius,
    setSelectedRadius,
    topCard,
    like,
    pass,
    updateLocation,
    refresh,
    isRefreshing: discoverQuery.isFetching && !discoverQuery.isLoading,
  };
}
