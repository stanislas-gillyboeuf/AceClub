import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useConversations } from "@/hooks/use-conversation";

export default function TabLayout() {
  const { data: session, isPending } = authClient.useSession();
  const isReady = !!session?.user && !!session.user.onboardingCompleted;

  usePushNotifications(isReady);

  const { data: conversations } = useConversations();
  const totalUnread = isReady
    ? (conversations?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0)
    : 0;

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!session.user.onboardingCompleted) {
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <NativeTabs tintColor={colors.accentGreen} minimizeBehavior="onScrollDown" >
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
