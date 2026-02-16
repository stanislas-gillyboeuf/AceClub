import { useState } from "react";
import { View, StyleSheet, Pressable, Modal, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { colors, semanticColors } from "@/constants/theme";
import { X } from "lucide-react-native";
import type { ChatMessage } from "./MessageBubble";

interface ImageMessageContentProps {
  message: ChatMessage;
}

export function ImageMessageContent({ message }: ImageMessageContentProps) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const w = message.attachmentWidth ?? 240;
  const h = message.attachmentHeight ?? 240;
  const ratio = w / h;
  const imageWidth = Math.min(240, Math.max(120, 240 * ratio));
  const imageHeight = Math.min(300, Math.max(120, imageWidth / ratio));

  if (!message.attachmentUrl) return null;

  return (
    <>
      <Pressable onPress={() => setShowFullScreen(true)} style={styles.wrapper}>
        <View style={[styles.imageContainer, { width: imageWidth, height: imageHeight }]}>
          <Image
            source={{ uri: message.attachmentUrl }}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            contentFit="cover"
            transition={200}
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                color={message.isFromMe ? colors.white : colors.accentGreen}
              />
            </View>
          )}
        </View>
      </Pressable>

      <Modal visible={showFullScreen} animationType="fade" transparent>
        <View style={styles.fullScreenContainer}>
          <Pressable style={styles.closeButton} onPress={() => setShowFullScreen(false)}>
            <X size={24} color={colors.white} />
          </Pressable>
          <Image
            source={{ uri: message.attachmentUrl }}
            style={styles.fullScreenImage}
            contentFit="contain"
            transition={300}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 3,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    borderRadius: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
});
