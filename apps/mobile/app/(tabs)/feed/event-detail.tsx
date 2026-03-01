import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EventDetailContent } from "@/features/events/components/event-detail-content";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <EventDetailContent
        eventId={eventId}
        onClose={() => router.back()}
      />
    </View>
  );
}
