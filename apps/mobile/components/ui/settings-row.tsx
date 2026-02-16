import { Pressable, View, Text, StyleSheet, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";

interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  style?: ViewStyle;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  style,
}: SettingsRowProps) {
  const scheme = useColorScheme();

  const labelColor = destructive ? "#ef4444" : semanticColors.labelPrimary[scheme];
  const valueColor = semanticColors.labelSecondary[scheme];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? { opacity: 0.6 } : undefined,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {value != null && (
          <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
      {showChevron && onPress && (
        <ChevronRight size={18} color={semanticColors.labelTertiary[scheme]} strokeWidth={2} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 28,
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
  },
  value: {
    fontSize: 14,
  },
});
