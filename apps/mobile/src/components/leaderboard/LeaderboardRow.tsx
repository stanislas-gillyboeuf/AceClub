import { View, Text } from "@/tw";
import { Avatar } from "@/components/ui/Avatar";
import type { LeaderboardEntry, WeeklyLeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardRowProps {
  entry: LeaderboardEntry | WeeklyLeaderboardEntry;
  currentUserId?: string;
  variant?: "global" | "weekly";
}

const rankColors: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

export function LeaderboardRow({
  entry,
  currentUserId,
  variant = "global",
}: LeaderboardRowProps) {
  const isCurrentUser = entry.user.id === currentUserId;
  const rankColor = rankColors[entry.rank];

  return (
    <View
      className={`flex-row items-center gap-3 px-horizontal py-3 ${
        isCurrentUser ? "bg-primary/5 dark:bg-primary-dark/5" : ""
      }`}
    >
      <View className="w-8 items-center">
        {rankColor ? (
          <Text
            className="text-lg font-sans-bold"
            style={{ color: rankColor }}
          >
            {entry.rank}
          </Text>
        ) : (
          <Text className="text-base font-sans-medium text-label-secondary">
            {entry.rank}
          </Text>
        )}
      </View>

      <Avatar
        imageUrl={entry.user.image}
        name={entry.user.name ?? "?"}
        size={40}
      />

      <View className="flex-1">
        <Text
          className={`text-base font-sans-medium text-label-primary dark:text-label-primary-dark ${
            isCurrentUser ? "font-sans-bold" : ""
          }`}
        >
          {entry.user.name}
          {isCurrentUser ? " (Vous)" : ""}
        </Text>
        {"level" in entry && (
          <Text className="text-xs font-sans text-label-secondary">
            Niveau {entry.level}
          </Text>
        )}
      </View>

      <View className="items-end">
        <Text className="text-base font-sans-bold text-primary dark:text-primary-dark">
          {"weeklyAces" in entry ? entry.weeklyAces : entry.aces}
        </Text>
        <Text className="text-xs font-sans text-label-secondary">Aces</Text>
      </View>
    </View>
  );
}
