import { View, Text } from "@/tw";
import { Calendar, Clock, MapPin, Swords } from "lucide-react-native";
import type { Match } from "@/types/match";
import type { Organization } from "@/types/organization";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface MatchInfoCardProps {
  match: Match;
  venueOrganization: Organization | null;
}

export function MatchInfoCard({ match, venueOrganization }: MatchInfoCardProps) {
  const dateStr = match.finishedAt ?? match.startedAt ?? match.scheduledAt ?? match.createdAt;
  const formattedDate = (() => {
    try {
      return format(parseISO(dateStr), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return "";
    }
  })();

  const duration = (() => {
    if (!match.startedAt || !match.finishedAt) return null;
    const ms = new Date(match.finishedAt).getTime() - new Date(match.startedAt).getTime();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  })();

  return (
    <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark gap-3">
      <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide">
        Informations
      </Text>

      <InfoRow
        icon={<Calendar size={16} color="#8E8E93" />}
        label="Date"
        value={formattedDate}
      />

      {duration && (
        <InfoRow
          icon={<Clock size={16} color="#8E8E93" />}
          label="Durée"
          value={duration}
        />
      )}

      <InfoRow
        icon={<Swords size={16} color="#8E8E93" />}
        label="Type"
        value={match.type === "training" ? "Entraînement" : "Match"}
      />

      {venueOrganization && (
        <InfoRow
          icon={<MapPin size={16} color="#8E8E93" />}
          label="Lieu"
          value={venueOrganization.name}
        />
      )}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <View className="flex-1">
        <Text className="text-xs font-sans text-label-secondary">{label}</Text>
        <Text className="text-sm font-sans text-label-primary dark:text-label-primary-dark">
          {value}
        </Text>
      </View>
    </View>
  );
}
