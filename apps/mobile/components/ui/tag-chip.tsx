import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { type LucideIcon } from "lucide-react-native";

interface TagChipProps {
  icon?: LucideIcon;
  label: string;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: "sm" | "md";
}

export function TagChip({
  icon: Icon,
  label,
  iconColor = "rgba(255,255,255,0.9)",
  backgroundColor = "rgba(255,255,255,0.15)",
  textColor = "#FFFFFF",
  size = "sm",
}: TagChipProps) {
  const isSmall = size === "sm";

  return (
    <View style={[styles.container, { backgroundColor }, isSmall ? styles.sm : styles.md]}>
      {Icon && (
        <Icon
          size={isSmall ? 10 : 13}
          color={iconColor}
          strokeWidth={2.5}
        />
      )}
      <Text
        style={[
          isSmall ? styles.labelSm : styles.labelMd,
          { color: textColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
  },
  sm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: "600",
  },
  labelMd: {
    fontSize: 13,
    fontWeight: "600",
  },
});
