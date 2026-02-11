import { useMemo } from "react";
import { Tabs } from "expo-router";
import {
  Home,
  Swords,
  MessageCircle,
  Search,
  User,
  Shield,
} from "lucide-react-native";
import { useColorScheme } from "react-native";
import { useAuthStore } from "@/stores/auth";
import { useConversations } from "@/hooks/useConversations";
import { selectionFeedback } from "@/lib/haptics";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const user = useAuthStore((s) => s.user);
  const isDark = colorScheme === "dark";

  const { data: conversations } = useConversations();
  const totalUnread = useMemo(
    () => (conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  const tintColor = isDark ? "#30D158" : "#34C759";
  const inactiveColor = "#8E8E93";
  const tabBarBg = isDark ? "#000000" : "#F2F2F7";

  return (
    <Tabs
      screenListeners={{
        tabPress: () => selectionFeedback(),
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: isDark ? "#3A3A3C" : "#E5E5EA",
        },
        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matchs",
          tabBarIcon: ({ color, size }) => <Swords size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Découvrir",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
          tabBarBadge: totalUnread > 0 ? (totalUnread > 99 ? "99+" : totalUnread) : undefined,
          tabBarBadgeStyle: { backgroundColor: "#34C759", fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
          href: user?.role === "admin" ? undefined : null,
        }}
      />
    </Tabs>
  );
}
