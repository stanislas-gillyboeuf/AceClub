import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";
import { Reply, Copy, Trash2 } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { QUICK_EMOJIS } from "../constants";
import type { ChatMessage } from "../types";

interface MessageContextMenuProps {
  message: ChatMessage | null;
  visible: boolean;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

export function MessageContextMenu({
  message,
  visible,
  onClose,
  onReply,
  onDelete,
  onReaction,
}: MessageContextMenuProps) {
  const scheme = useColorScheme();

  if (!message) return null;

  const handleCopy = () => {
    // noop for now — expo-clipboard not installed
    onClose();
  };

  const handleReply = () => {
    onReply(message);
    onClose();
  };

  const handleDelete = () => {
    onDelete(message);
    onClose();
  };

  const handleEmojiPress = (emoji: string) => {
    Haptics.selectionAsync();
    onReaction(message.id, emoji);
    onClose();
  };

  const menuBg = semanticColors.cardBackground[scheme];
  const textColor = semanticColors.labelPrimary[scheme];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                scheme === "dark"
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(0,0,0,0.3)",
            },
          ]}
        />

        <Animated.View
          entering={ZoomIn.springify().damping(15).stiffness(200)}
          style={styles.content}
        >
          {/* Quick emoji bar */}
          <Animated.View
            entering={FadeIn.delay(50).duration(200)}
            style={[styles.emojiBar, { backgroundColor: menuBg }]}
          >
            {QUICK_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => handleEmojiPress(emoji)}
                style={styles.emojiButton}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </Animated.View>

          {/* Action menu */}
          <Animated.View
            entering={FadeIn.delay(100).duration(200)}
            style={[styles.menu, { backgroundColor: menuBg }]}
          >
            <Pressable
              onPress={handleReply}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Text style={[styles.menuItemText, { color: textColor }]}>
                Répondre
              </Text>
              <Reply size={18} color={textColor} />
            </Pressable>

            <View
              style={[
                styles.separator,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                },
              ]}
            />

            {message.type === "text" && message.content && (
              <>
                <Pressable
                  onPress={handleCopy}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  <Text style={[styles.menuItemText, { color: textColor }]}>
                    Copier
                  </Text>
                  <Copy size={18} color={textColor} />
                </Pressable>

                <View
                  style={[
                    styles.separator,
                    {
                      backgroundColor:
                        scheme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.08)",
                    },
                  ]}
                />
              </>
            )}

            {message.isFromMe && (
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Text style={[styles.menuItemText, { color: colors.red500 }]}>
                  Supprimer
                </Text>
                <Trash2 size={18} color={colors.red500} />
              </Pressable>
            )}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 8,
    width: 260,
  },
  emojiBar: {
    flexDirection: "row",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  emojiButton: {
    padding: 6,
    borderRadius: 10,
  },
  emojiText: {
    fontSize: 24,
  },
  menu: {
    borderRadius: 14,
    width: "100%",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  menuItemText: {
    fontSize: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
