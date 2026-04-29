import { View, Text, Pressable, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { GlassView } from "@/components/ui/glass-view";
import { Avatar } from "@/components/ui/avatar";
import { colors, semanticColors, radii } from "@/constants/theme";
import type { UserSearchItem } from "@/types/user";
import { GhostBadge } from "./ghost-badge";

interface UserSearchResultRowProps {
  user: UserSearchItem;
  isSelected: boolean;
  onPress: () => void;
  scheme: "light" | "dark";
}

export function UserSearchResultRow({
  user,
  isSelected,
  onPress,
  scheme,
}: UserSearchResultRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <GlassView
        style={styles.card}
        tintColor={isSelected ? `${colors.accentGreen}20` : undefined}
      >
        <Avatar imageUrl={user.image} name={user.name} size={46} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]}
              numberOfLines={1}
            >
              {user.name}
            </Text>
            {user.isGhost && <GhostBadge />}
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkCircle}>
            <Check size={14} color="#fff" strokeWidth={3} />
          </View>
        )}
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
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: "500",
    flexShrink: 1,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentGreen,
    alignItems: "center",
    justifyContent: "center",
  },
});
