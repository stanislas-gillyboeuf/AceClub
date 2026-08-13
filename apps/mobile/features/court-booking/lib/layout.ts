import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Fixed content height of the native bottom tab bar (excludes the home-indicator safe area). */
const TAB_BAR_CONTENT_HEIGHT = Platform.select({ ios: 49, android: 56, default: 49 });

/** Extra bottom clearance needed so content isn't hidden behind the native tab bar on a pushed screen. */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_CONTENT_HEIGHT + insets.bottom;
}
