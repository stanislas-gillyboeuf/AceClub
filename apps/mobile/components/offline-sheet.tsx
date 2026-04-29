import { useEffect, useRef } from "react";
import { useNetworkState } from "expo-network";
import { usePathname, useRouter } from "expo-router";

export function OfflineSheet() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const isOffline =
    isConnected === false || isInternetReachable === false;

  const router = useRouter();
  const pathname = usePathname();
  const openedRef = useRef(false);

  useEffect(() => {
    const onOfflineRoute = pathname === "/offline";

    if (isOffline && !onOfflineRoute && !openedRef.current) {
      openedRef.current = true;
      router.push("/offline");
    } else if (!isOffline && openedRef.current) {
      openedRef.current = false;
      if (onOfflineRoute) {
        router.back();
      }
    }
  }, [isOffline, pathname, router]);

  return null;
}
