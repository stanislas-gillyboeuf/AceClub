import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { EventDetailContent } from "@/features/events/components/event-detail-content";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <View style={{ flex: 1 }}>
      <EventDetailContent eventId={eventId} />
    </View>
  );
}
