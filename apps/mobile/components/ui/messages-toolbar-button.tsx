import { Stack, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { useUnreadMessagesCount } from "@/hooks/use-conversation";

export function MessagesToolbarButton() {
  const router = useRouter();
  const totalUnread = useUnreadMessagesCount();

  return (
    <Stack.Toolbar.Button onPress={() => router.push("/chat")} tintColor={colors.accentGreen}>
      <Stack.Toolbar.Icon sf="message" />
      {totalUnread > 0 && (
        <Stack.Toolbar.Badge>{totalUnread > 99 ? "99+" : String(totalUnread)}</Stack.Toolbar.Badge>
      )}
    </Stack.Toolbar.Button>
  );
}
