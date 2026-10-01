import { View, Text, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { Check, type LucideIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { onboardingColors } from "../theme";

interface SelectableCardProps {
  label: string;
  subtitle?: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  /** Fixed card height — 88 for sport cards, 76 for level-tier cards. */
  height: number;
  style?: ViewStyle;
}

export function SelectableCard({
  label,
  subtitle,
  icon: Icon,
  selected,
  onPress,
  height,
  style,
}: SelectableCardProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <View style={[styles.card, { height }, selected && styles.cardSelected]}>
        {Icon && (
          <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
            <Icon
              size={20}
              color={selected ? onboardingColors.accent : onboardingColors.fgDim}
              strokeWidth={2}
            />
          </View>
        )}

        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
          {selected && <Check size={14} color={onboardingColors.accentForeground} strokeWidth={2.5} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: onboardingColors.cardBg,
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
  },
  cardSelected: {
    backgroundColor: onboardingColors.cardBgSelected,
    borderColor: onboardingColors.cardBorderSelected,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  iconCircleSelected: {
    backgroundColor: "rgba(201,241,105,0.16)",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
    color: onboardingColors.fg,
  },
  subtitle: {
    fontSize: 13,
    color: onboardingColors.fgDim,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: onboardingColors.cardBorder,
  },
  checkCircleSelected: {
    backgroundColor: onboardingColors.accent,
    borderColor: onboardingColors.accent,
  },
});
