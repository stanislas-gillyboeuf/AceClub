import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDiscover } from "@/hooks/use-match-intent";
import type { MatchIntentWithUser } from "@/types/match-intent";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
}

export function useDiscoverList() {
  const [sport, setSport] = useState<"tennis" | "padel">("tennis");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<LocationState>({ latitude: null, longitude: null });
  const [items, setItems] = useState<MatchIntentWithUser[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const queryParams = useMemo(
    () => ({
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
      radius: selectedRadius,
      sport,
      levels: selectedLevels,
      cursor,
      limit: 20,
    }),
    [location.latitude, location.longitude, selectedRadius, sport, selectedLevels, cursor]
  );

  const discoverQuery = useDiscover(queryParams);
  const isDiscoveryRestricted = discoverQuery.data?.isDiscoveryRestricted ?? false;

  // Reset the accumulated list whenever a filter changes (new cursor-less fetch)
  useEffect(() => {
    setCursor(undefined);
    setItems([]);
  }, [sport, selectedLevels, selectedRadius, location.latitude, location.longitude]);

  useEffect(() => {
    if (!discoverQuery.data) return;
    setItems((prev) => (cursor ? [...prev, ...discoverQuery.data.data] : discoverQuery.data.data));
  }, [discoverQuery.data, cursor]);

  const hasMore = discoverQuery.data?.pagination.hasMore ?? false;
  const nextCursor = discoverQuery.data?.pagination.nextCursor ?? undefined;

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !discoverQuery.isFetching) {
      setCursor(nextCursor);
    }
  }, [hasMore, nextCursor, discoverQuery.isFetching]);

  const toggleLevel = useCallback((level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }, []);

  const changeSport = useCallback((next: "tennis" | "padel") => {
    setSport(next);
    setSelectedLevels([]);
  }, []);

  const updateLocation = useCallback((lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
  }, []);

  const refetchRef = useRef(discoverQuery.refetch);
  refetchRef.current = discoverQuery.refetch;
  const refresh = useCallback(async () => {
    setCursor(undefined);
    await refetchRef.current();
  }, []);

  return {
    items,
    sport,
    changeSport,
    selectedLevels,
    toggleLevel,
    selectedRadius,
    setSelectedRadius,
    isDiscoveryRestricted,
    isLoading: discoverQuery.isLoading,
    isRefreshing: discoverQuery.isFetching && !discoverQuery.isLoading && !cursor,
    isFetchingMore: discoverQuery.isFetching && !!cursor,
    hasMore,
    loadMore,
    updateLocation,
    refresh,
  };
}
