import { Platform, useColorScheme } from "react-native";
import { View } from "@/tw";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BlurHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function BlurHeader({ children, className }: BlurHeaderProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={{ paddingTop: insets.top }}
      >
        <View className={className}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View
      className={`bg-bg-primary dark:bg-bg-primary-dark ${className ?? ""}`}
      style={{ paddingTop: insets.top }}
    >
      {children}
    </View>
  );
}
