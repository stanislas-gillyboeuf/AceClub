import { View, StyleSheet, type ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color: string;
  height?: number;
  trackStyle?: ViewStyle;
}

export function ProgressBar({
  progress,
  color,
  height = 10,
  trackStyle,
}: ProgressBarProps) {
  const scheme = useColorScheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor:
            scheme === "dark" ? "#3A3A3C" : semanticColors.skeleton[scheme],
        },
        trackStyle,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: color,
            width: `${clampedProgress * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
  },
  fill: {},
});
