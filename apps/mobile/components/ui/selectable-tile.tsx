import { type ReactNode } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { GlassView } from "@/components/ui/glass-view";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";

interface SelectableTileProps {
  icon: ReactNode;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  accentColor?: string;
  iconSize?: number;
}

export function SelectableTile({
  icon,
  label,
  isSelected,
  onPress,
  accentColor = colors.accentGreen,
  iconSize = 80,
}: SelectableTileProps) {
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
        tintColor={isSelected ? `${accentColor}20` : undefined}
      >
        <View
          style={[
            styles.iconCircle,
            {
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              backgroundColor: isSelected
                ? `${accentColor}26`
                : `${accentColor}0F`,
            },
          ]}
        >
          {icon}
        </View>

        <Text
          style={[
            styles.label,
            {
              color: isSelected
                ? accentColor
                : semanticColors.labelPrimary[scheme],
            },
          ]}
        >
          {label}
        </Text>

        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: accentColor }]}>
            <Check size={14} color="#fff" strokeWidth={3} />
          </View>
        )}
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: radii.lg,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  tile: {
    alignItems: "center",
    paddingVertical: 28,
    borderRadius: radii.lg,
    gap: 16,
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
