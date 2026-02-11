import { View, Text, Pressable } from "@/tw";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchListItem } from "@/types/match";
import {
  getHomeParticipant,
  getAwayParticipant,
  formatMatchScore,
} from "@/lib/match-utils";

interface OngoingMatchCardProps {
  match: MatchListItem;
  onPress?: () => void;
}

export function OngoingMatchCard({ match, onPress }: OngoingMatchCardProps) {
  const home = getHomeParticipant(match.participants);
  const away = getAwayParticipant(match.participants);
  const score = formatMatchScore(match.sets, match.participants);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="w-[200px] p-3 bg-bg-card dark:bg-bg-card-dark rounded-md border-2 border-accent-orange/30">
        {/* Top row: badge + set count */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="bg-accent-orange px-2 py-1 rounded-full">
            <Text className="text-[11px] font-sans-semibold text-white">
              En cours
            </Text>
          </View>
          <Text className="text-xs font-sans text-label-secondary">
            Set {match.sets.length}
          </Text>
        </View>

        {/* Players + score */}
        <View className="flex-row items-center justify-between">
          <PlayerView
            name={home?.user?.name ?? "N/A"}
            imageUrl={home?.user?.image}
          />

          <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark font-mono">
            {score}
          </Text>

          <PlayerView
            name={away?.user?.name ?? "N/A"}
            imageUrl={away?.user?.image}
          />
        </View>
      </View>
    </Pressable>
  );
}

function PlayerView({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const firstName = name.split(" ")[0] ?? name;

  return (
    <View className="items-center gap-1">
      <Avatar imageUrl={imageUrl} name={name} size={32} />
      <Text
        className="text-[10px] font-sans text-label-primary dark:text-label-primary-dark"
        numberOfLines={1}
      >
        {firstName}
      </Text>
    </View>
  );
}
