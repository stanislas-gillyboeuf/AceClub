import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";

function openOSSettings() {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
}

export function useOSPermissions() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const checkPermissions = useCallback(async () => {
    const { status: notifStatus } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(notifStatus === "granted");

    const { status: locStatus } = await Location.getForegroundPermissionsAsync();
    setLocationEnabled(locStatus === "granted");
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  const handleNotificationsToggle = useCallback(async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setNotificationsEnabled(true);
      } else {
        openOSSettings();
      }
    } else {
      openOSSettings();
    }
  }, []);

  const handleLocationToggle = useCallback(async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationEnabled(true);
      } else {
        openOSSettings();
      }
    } else {
      openOSSettings();
    }
  }, []);

  return {
    notificationsEnabled,
    locationEnabled,
    handleNotificationsToggle,
    handleLocationToggle,
  };
}
