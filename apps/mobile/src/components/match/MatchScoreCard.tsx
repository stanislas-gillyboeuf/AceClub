import { View, Text } from "@/tw";
import { Crown } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchParticipant, MatchSet } from "@/types/match";
import { getHomeParticipant, getAwayParticipant, getMatchScore } from "@/lib/match-utils";

interface MatchScoreCardProps {
  participants: MatchParticipant[];
  sets: MatchSet[];
  status: string;
}

export function MatchScoreCard({ participants, sets, status }: MatchScoreCardProps) {
  const home = getHomeParticipant(participants);
  const away = getAwayParticipant(participants);
  const score = getMatchScore(sets, participants);

  return (
    <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark">
      <View className="flex-row items-center justify-between">
        {/* Home player */}
        <PlayerColumn
          name={home?.user?.name ?? "N/A"}
          imageUrl={home?.user?.image}
          isWinner={home?.isWinner ?? false}
        />

        {/* Score */}
        <View className="items-center gap-1">
          {status === "ongoing" && (
            <View className="bg-accent-orange px-2 py-0.5 rounded-full mb-1">
              <Text className="text-[10px] font-sans-semibold text-white">
                EN COURS
              </Text>
            </View>
          )}
          <Text className="text-3xl font-sans-bold text-label-primary dark:text-label-primary-dark font-mono">
            {score.home} - {score.away}
          </Text>
          {sets.length > 0 && (
            <Text className="text-xs font-sans text-label-secondary">
              {sets.length} set{sets.length > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Away player */}
        <PlayerColumn
          name={away?.user?.name ?? "N/A"}
          imageUrl={away?.user?.image}
          isWinner={away?.isWinner ?? false}
        />
      </View>
    </View>
  );
}

function PlayerColumn({
  name,
  imageUrl,
  isWinner,
}: {
  name: string;
  imageUrl?: string | null;
  isWinner: boolean;
}) {
  const firstName = name.split(" ")[0] ?? name;

  return (
    <View className="items-center gap-2 w-24">
      <Avatar imageUrl={imageUrl} name={name} size={56} />
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-sm ${isWinner ? "font-sans-bold" : "font-sans"} text-label-primary dark:text-label-primary-dark`}
          numberOfLines={1}
        >
          {firstName}
        </Text>
        {isWinner && <Crown size={12} color="#FFD700" fill="#FFD700" />}
      </View>
    </View>
  );
}
