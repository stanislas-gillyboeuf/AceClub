import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <NativeTabs tintColor={colors.accentGreen}>
      <NativeTabs.Trigger name="feed">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="custom_home_drawable" />
        <Label>Feed</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="matches">
        <Icon sf={{ default: "sportscourt", selected: "sportscourt.fill" }} />
        <Label>Matches</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <Icon sf={{ default: "message", selected: "message.fill" }} />
        <Label>Chat</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
