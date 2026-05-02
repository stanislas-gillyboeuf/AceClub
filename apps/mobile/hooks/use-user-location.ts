import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export function useUserLocation(): UserCoords | null {
  const [coords, setCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}
