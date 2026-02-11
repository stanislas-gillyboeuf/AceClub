import { View, Text } from "@/tw";
import type { MatchSet, MatchParticipant } from "@/types/match";
import { getHomeParticipant, getAwayParticipant, getSetWinner } from "@/lib/match-utils";

interface MatchSetsCardProps {
  sets: MatchSet[];
  participants: MatchParticipant[];
}

export function MatchSetsCard({ sets, participants }: MatchSetsCardProps) {
  const home = getHomeParticipant(participants);
  const away = getAwayParticipant(participants);

  if (sets.length === 0) return null;

  const sortedSets = [...sets].sort((a, b) => a.setNumber - b.setNumber);

  return (
    <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark">
      <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wide mb-3">
        Détail des sets
      </Text>

      {/* Header */}
      <View className="flex-row items-center mb-2 pb-2 border-b border-border dark:border-border-dark">
        <Text className="flex-1 text-sm font-sans-semibold text-label-primary dark:text-label-primary-dark">
          {home?.user?.name?.split(" ")[0] ?? "Domicile"}
        </Text>
        <View className="w-16 items-center">
          <Text className="text-xs font-sans text-label-secondary">Set</Text>
        </View>
        <Text className="flex-1 text-sm font-sans-semibold text-label-primary dark:text-label-primary-dark text-right">
          {away?.user?.name?.split(" ")[0] ?? "Extérieur"}
        </Text>
      </View>

      {/* Sets */}
      {sortedSets.map((set) => {
        const homeScore = set.scores.find((s) => s.side === "home")?.games ?? 0;
        const awayScore = set.scores.find((s) => s.side === "away")?.games ?? 0;
        const winner = getSetWinner(set);
        const homeWon = winner === home?.user?.id;
        const awayWon = winner === away?.user?.id;

        return (
          <View key={set.id} className="flex-row items-center py-2">
            <Text
              className={`flex-1 text-base font-mono ${
                homeWon
                  ? "font-sans-bold text-primary dark:text-primary-dark"
                  : "font-sans text-label-primary dark:text-label-primary-dark"
              }`}
            >
              {homeScore}
            </Text>
            <View className="w-16 items-center">
              <View className="bg-bg-secondary dark:bg-bg-secondary-dark px-3 py-1 rounded-full">
                <Text className="text-xs font-sans-medium text-label-secondary">
                  {set.setNumber}
                </Text>
              </View>
            </View>
            <Text
              className={`flex-1 text-base font-mono text-right ${
                awayWon
                  ? "font-sans-bold text-primary dark:text-primary-dark"
                  : "font-sans text-label-primary dark:text-label-primary-dark"
              }`}
            >
              {awayScore}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
