import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import * as LucideIcons from "lucide-react-native";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon, title, description, containerStyle }: EmptyStateProps) {
  const scheme = useColorScheme();
  const iconColor = semanticColors.labelTertiary[scheme];

  const IconComponent =
    (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[icon] ??
    LucideIcons.CircleAlert;

  return (
    <View style={[styles.container, containerStyle]}>
      <IconComponent size={48} color={iconColor} strokeWidth={1.5} />
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: semanticColors.labelSecondary[scheme] }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
  },
});
