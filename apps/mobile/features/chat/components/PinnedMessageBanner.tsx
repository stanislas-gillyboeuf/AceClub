import { Text, StyleSheet, Pressable } from "react-native";
import { Pin } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import type { ChatMessage } from "../types";

interface PinnedMessageBannerProps {
  message: ChatMessage;
  onPress?: () => void;
}

export function PinnedMessageBanner({ message, onPress }: PinnedMessageBannerProps) {
  const scheme = useColorScheme();
  const preview =
    message.type === "voice" ? "Message vocal" : message.type === "image" ? "Photo" : message.content;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: semanticColors.cardBackground[scheme] }]}
    >
      <Pin size={14} color={semanticColors.accentGreen[scheme]} />
      <Text style={[styles.text, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
        {preview}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
