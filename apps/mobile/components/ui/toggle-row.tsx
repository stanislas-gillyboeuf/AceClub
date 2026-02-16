import { View, Text, Switch, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";

interface ToggleRowProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleRowProps) {
  const scheme = useColorScheme();

  return (
    <View style={styles.row}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.label, { color: semanticColors.labelPrimary[scheme] }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, { color: semanticColors.labelSecondary[scheme] }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: semanticColors.labelTertiary[scheme], true: colors.accentGreen }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
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
  description: {
    fontSize: 13,
  },
});
