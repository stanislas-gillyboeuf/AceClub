import { Redirect, useSegments } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useConversations } from "@/hooks/use-conversation";

export default function TabLayout() {
  const { data: session } = authClient.useSession();
  const isReady = !!session && !!(session.user as any).onboardingCompleted;
  const segments = useSegments();

  usePushNotifications(isReady);

  const { data: conversations } = useConversations();
  const totalUnread = isReady
    ? (conversations?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0)
    : 0;

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!(session.user as any).onboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  // Hide tab bar when inside a conversation
  const isInConversation =
    segments.length >= 3 &&
    segments[1] === "chat" &&
    segments[2] !== "new" &&
    segments[2] !== "index";

  return (
    <NativeTabs tintColor={colors.accentGreen} hidden={isInConversation}>
      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="matches">
        <NativeTabs.Trigger.Icon sf={{ default: "sportscourt", selected: "sportscourt.fill" }} md="sports_tennis" />
        <NativeTabs.Trigger.Label>Matches</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Icon sf={{ default: "message", selected: "message.fill" }} md="chat" />
        <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
        {totalUnread > 0 && (
          <NativeTabs.Trigger.Badge>
            {totalUnread > 99 ? "99+" : String(totalUnread)}
          </NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} md="search" />
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
