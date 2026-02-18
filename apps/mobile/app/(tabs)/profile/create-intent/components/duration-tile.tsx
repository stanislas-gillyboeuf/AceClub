import { Pressable, View, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { Clock, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { formatDurationLabel } from "@/store/create-intent-form";

interface DurationTileProps {
  minutes: number;
  isSelected: boolean;
  onPress: () => void;
}

export function DurationTile({
  minutes,
  isSelected,
  onPress,
}: DurationTileProps) {
  const scheme = useColorScheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
      ]}
    >
      <GlassView
        style={styles.tile}
        tintColor={isSelected ? `${colors.accentGreen}20` : undefined}
      >
        <Clock
          size={24}
          color={isSelected ? colors.accentGreen : semanticColors.labelSecondary[scheme]}
          strokeWidth={1.8}
        />
        <Text
          style={[
            styles.label,
            {
              color: isSelected
                ? colors.accentGreen
                : semanticColors.labelPrimary[scheme],
            },
          ]}
        >
          {formatDurationLabel(minutes)}
        </Text>

        {isSelected && (
          <View style={styles.checkBadge}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </View>
        )}
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    height: 90,
    borderRadius: radii.lg,
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
});
