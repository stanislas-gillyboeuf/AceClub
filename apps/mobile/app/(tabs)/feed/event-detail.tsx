import { useLocalSearchParams } from "expo-router";
import { EventDetailContent } from "@/features/events/components/event-detail-content";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return <EventDetailContent eventId={eventId} />;
}
