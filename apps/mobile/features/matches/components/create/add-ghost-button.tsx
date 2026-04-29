import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { UserPlus } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { colors, semanticColors, radii } from "@/constants/theme";

interface AddGhostButtonProps {
  onPress: () => void;
  scheme: "light" | "dark";
}

export function AddGhostButton({ onPress, scheme }: AddGhostButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <GlassView style={styles.card} tintColor={`${colors.accentGreen}15`}>
        <View style={styles.icon}>
          <UserPlus size={22} color={colors.accentGreen} />
        </View>
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
            numberOfLines={1}
          >
            Ajouter un joueur externe
          </Text>
          <Text
            style={[styles.hint, { color: semanticColors.labelSecondary[scheme] }]}
            numberOfLines={1}
          >
            {"Joueur pas encore sur l'app"}
          </Text>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 16,
    borderRadius: radii.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radii.lg,
    gap: 14,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${colors.accentGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: "500",
    flexShrink: 1,
  },
  hint: {
    fontSize: 14,
  },
});
