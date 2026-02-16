import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors } from "@/constants/theme";
import type { ReactionGroup } from "@/types/conversation";

interface ReactionBarProps {
  reactions: ReactionGroup[];
  isFromMe: boolean;
  onToggleReaction: (emoji: string) => void;
}

export function ReactionBar({
  reactions,
  isFromMe,
  onToggleReaction,
}: ReactionBarProps) {
  const scheme = useColorScheme();

  if (!reactions || reactions.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        isFromMe ? styles.containerRight : styles.containerLeft,
      ]}
    >
      {reactions.map((reaction) => (
        <Animated.View
          key={reaction.emoji}
          entering={FadeIn.springify().damping(15).stiffness(200)}
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              onToggleReaction(reaction.emoji);
            }}
            style={[
              styles.capsule,
              {
                backgroundColor: reaction.hasReacted
                  ? scheme === "dark"
                    ? "rgba(33,135,77,0.3)"
                    : "rgba(33,135,77,0.15)"
                  : scheme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
                borderColor: reaction.hasReacted
                  ? colors.accentGreen
                  : "transparent",
              },
            ]}
          >
            <Text style={styles.emoji}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text
                style={[
                  styles.count,
                  {
                    color: reaction.hasReacted
                      ? colors.accentGreen
                      : scheme === "dark"
                        ? "#8E8E93"
                        : "#6B7280",
                  },
                ]}
              >
                {reaction.count}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  containerRight: {
    justifyContent: "flex-end",
  },
  containerLeft: {
    justifyContent: "flex-start",
  },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 12,
    fontWeight: "600",
  },
});
