import { View, Text, Pressable } from "@/tw";
import { Calendar, Clock, Crown } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchListItem } from "@/types/match";
import {
  getHomeParticipant,
  getAwayParticipant,
  formatMatchScore,
  getMatchDuration,
} from "@/lib/match-utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface MatchRowProps {
  match: MatchListItem;
  onPress?: () => void;
}

const statusConfig: Record<string, { label: string; bg: string }> = {
  ongoing: { label: "En cours", bg: "bg-accent-orange" },
  finished: { label: "Terminé", bg: "bg-primary dark:bg-primary-dark" },
  scheduled: { label: "Planifié", bg: "bg-label-secondary" },
};

export function MatchRow({ match, onPress }: MatchRowProps) {
  const home = getHomeParticipant(match.participants);
  const away = getAwayParticipant(match.participants);
  const score = formatMatchScore(match.sets, match.participants);
  const duration = getMatchDuration(match);
  const config = statusConfig[match.status] ?? statusConfig.scheduled;

  const dateStr = match.finishedAt ?? match.startedAt ?? match.scheduledAt ?? match.createdAt;
  const formattedDate = (() => {
    try {
      return format(parseISO(dateStr), "EEE. d MMM", { locale: fr });
    } catch {
      return "";
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark">
        {/* Top row: date + status badge */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={14} color="#8E8E93" />
            <Text className="text-sm font-sans text-label-secondary">
              {formattedDate}
            </Text>
          </View>

          <View className={`px-3 py-1 rounded-full ${config.bg}`}>
            <Text className="text-[11px] font-sans-semibold text-white">
              {config.label}
            </Text>
          </View>
        </View>

        {/* Players + score */}
        <View className="flex-row items-center mt-3 gap-3">
          <PlayerChip
            name={home?.user?.name ?? "N/A"}
            imageUrl={home?.user?.image}
            isWinner={home?.isWinner ?? false}
          />

          <Text className="text-sm font-sans text-label-secondary">vs</Text>

          <PlayerChip
            name={away?.user?.name ?? "N/A"}
            imageUrl={away?.user?.image}
            isWinner={away?.isWinner ?? false}
          />

          <View className="flex-1" />

          <View className="items-end gap-1">
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark font-mono">
              {score}
            </Text>
            {duration && (
              <View className="flex-row items-center gap-1">
                <Clock size={10} color="#8E8E93" />
                <Text className="text-xs font-sans text-label-secondary">
                  {duration}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function PlayerChip({
  name,
  imageUrl,
  isWinner,
}: {
  name: string;
  imageUrl?: string | null;
  isWinner: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Avatar imageUrl={imageUrl} name={name} size={36} />
      <View className="gap-0.5">
        <View className="flex-row items-center gap-1">
          <Text
            className={`text-sm ${isWinner ? "font-sans-bold" : "font-sans"} text-label-primary dark:text-label-primary-dark`}
            numberOfLines={1}
          >
            {name}
          </Text>
          {isWinner && <Crown size={10} color="#FFD700" fill="#FFD700" />}
        </View>
      </View>
    </View>
  );
}
