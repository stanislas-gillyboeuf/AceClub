import * as Location from "expo-location";
import { useLocationStore } from "@/stores/location";

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = location.coords;
  useLocationStore.getState().setLocation(latitude, longitude);

  return { latitude, longitude };
}
