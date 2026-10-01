import { View, StyleSheet } from "react-native";
import { onboardingColors } from "../theme";

interface SegmentProgressBarProps {
  /** 0 = Sport, 1 = Niveau, 2 = Photo */
  activeIndex: 0 | 1 | 2;
}

const SEGMENT_COUNT = 3;

export function SegmentProgressBar({ activeIndex }: SegmentProgressBarProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
        <View
          key={i}
          style={[styles.segment, i <= activeIndex && styles.segmentActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(244,241,232,0.16)",
  },
  segmentActive: {
    backgroundColor: onboardingColors.accent,
  },
});
