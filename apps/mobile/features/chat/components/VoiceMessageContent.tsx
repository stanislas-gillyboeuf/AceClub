import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { colors, semanticColors } from "@/constants/theme";
import { Play, Pause } from "lucide-react-native";
import type { ChatMessage } from "./MessageBubble";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface VoiceMessageContentProps {
  message: ChatMessage;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VoiceMessageContent({ message }: VoiceMessageContentProps) {
  const { isPlaying, isLoading, progress, togglePlayback } = useAudioPlayer(message.id);
  const isFromMe = message.isFromMe;
  const tintColor = isFromMe ? colors.white : colors.accentGreen;
  const secondaryColor = isFromMe ? "rgba(255,255,255,0.8)" : semanticColors.labelSecondary.light;

  // Deterministic waveform heights based on message.id — avoids re-render jitter
  const barHeights = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < message.id.length; i++) {
      seed += message.id.charCodeAt(i);
    }
    return Array.from({ length: 20 }, (_, i) =>
      4 + Math.sin(i * 0.8) * 10 + seededRandom(seed + i) * 4,
    );
  }, [message.id]);

  const handlePress = () => {
    if (message.attachmentUrl) {
      togglePlayback(message.attachmentUrl);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.playButton}>
        {isLoading ? (
          <ActivityIndicator size="small" color={tintColor} />
        ) : isPlaying ? (
          <Pause size={20} color={tintColor} fill={tintColor} />
        ) : (
          <Play size={20} color={tintColor} fill={tintColor} />
        )}
      </Pressable>

      <View style={styles.waveform}>
        {barHeights.map((h, i) => {
          const filled = progress > i / 20;
          return (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: h,
                  backgroundColor: filled ? tintColor : `${tintColor}40`,
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.duration, { color: secondaryColor }]}>
        {formatDuration(message.attachmentDuration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 180,
  },
  playButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
  },
  duration: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
});
