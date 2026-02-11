import { View, Text } from "@/tw";
import { Target } from "lucide-react-native";
import type { Challenge } from "@/types/challenge";

interface ChallengeRowProps {
  challenge: Challenge;
}

const difficultyColors: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

export function ChallengeRow({ challenge }: ChallengeRowProps) {
  const progress = Math.min(
    challenge.currentProgress / challenge.targetValue,
    1
  );
  const color = difficultyColors[challenge.difficulty] ?? "#34C759";

  return (
    <View className="flex-row items-center gap-3 py-3">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Target size={20} color={color} />
      </View>

      <View className="flex-1">
        <Text className="text-sm font-sans-medium text-label-primary dark:text-label-primary-dark">
          {challenge.title}
        </Text>
        <Text className="text-xs font-sans text-label-secondary mt-0.5">
          {challenge.description}
        </Text>

        {/* Progress bar */}
        <View className="h-1.5 bg-bg-secondary dark:bg-bg-secondary-dark rounded-full overflow-hidden mt-2">
          <View
            className="h-full rounded-full"
            style={{ width: `${progress * 100}%`, backgroundColor: color }}
          />
        </View>
      </View>

      <View className="items-end">
        <Text className="text-xs font-sans-medium text-label-primary dark:text-label-primary-dark">
          {challenge.currentProgress}/{challenge.targetValue}
        </Text>
        <Text className="text-xs font-sans text-primary dark:text-primary-dark mt-0.5">
          +{challenge.acesReward} Aces
        </Text>
      </View>
    </View>
  );
}
