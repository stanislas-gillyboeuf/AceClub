import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "@/constants/theme";
import { useConversations } from "@/hooks/use-conversation";

export function MessagesHeaderButton() {
  const { data: conversations } = useConversations();
  const totalUnread = conversations?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0;

  return (
    <Pressable onPress={() => router.push("/chat")} hitSlop={8} style={styles.wrap}>
      <MaterialIcons name="chat-bubble-outline" size={24} color={colors.accentGreen} />
      {totalUnread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalUnread > 99 ? "99+" : String(totalUnread)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.red500,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
});
