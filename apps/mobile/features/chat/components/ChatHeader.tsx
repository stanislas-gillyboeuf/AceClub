import { useCallback } from "react";
import { Pressable, Text, StyleSheet, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Avatar } from "@/components/ui/avatar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { semanticColors } from "@/constants/theme";
import { getDisplayName, getAvatarUrl } from "../utils/message-helpers";
import type { Conversation } from "@/types/conversation";

interface ChatHeaderProps {
  conversation: Conversation;
  onToggleMute: () => void;
  onDeleteConversation: () => void;
}

export function ChatHeader({
  conversation,
  onToggleMute,
  onDeleteConversation,
}: ChatHeaderProps) {
  const scheme = useColorScheme();
  const router = useRouter();

  const displayName = getDisplayName(conversation);
  const avatarUrl = getAvatarUrl(conversation);

  const handleProfilePress = useCallback(() => {
    Alert.alert(displayName, undefined, [
      {
        text: conversation.isMuted ? "R\u00e9activer" : "Mettre en sourdine",
        onPress: onToggleMute,
      },
      {
        text: "Supprimer la conversation",
        style: "destructive",
        onPress: () => {
          onDeleteConversation();
          router.back();
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  }, [displayName, conversation.isMuted, onToggleMute, onDeleteConversation, router]);

  return (
    <Stack.Screen
      options={{
        headerTransparent: Platform.OS === "ios",
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
            {Platform.OS === "ios" ? (
              <Ionicons name="chevron-back" size={28} color={semanticColors.labelPrimary[scheme]} />
            ) : (
              <MaterialIcons name="arrow-back" size={24} color={semanticColors.labelPrimary[scheme]} />
            )}
          </Pressable>
        ),
        headerTitle: () => (
          <Pressable onPress={handleProfilePress} style={styles.headerTitle}>
            <Avatar imageUrl={avatarUrl} name={displayName} size={28} />
            <Text
              style={[styles.headerName, { color: semanticColors.labelPrimary[scheme] }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </Pressable>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "600",
  },
});
