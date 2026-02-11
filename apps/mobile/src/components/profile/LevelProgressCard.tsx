import { View, Text } from "@/tw";
import { Card } from "@/components/ui/Card";
import type { UserLevel } from "@/types/level";

interface LevelProgressCardProps {
  level: UserLevel;
}

export function LevelProgressCard({ level }: LevelProgressCardProps) {
  const progressPercent = Math.min(level.progressPercent, 100);

  return (
    <Card className="p-card">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-sans-semibold text-label-primary dark:text-label-primary-dark">
          Niveau {level.level}
        </Text>
        <Text className="text-sm font-sans-medium text-primary dark:text-primary-dark">
          {level.totalAces} Aces
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-2.5 bg-bg-secondary dark:bg-bg-secondary-dark rounded-full overflow-hidden">
        <View
          className="h-full bg-primary dark:bg-primary-dark rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xs font-sans text-label-secondary">
          {level.currentLevelAces} / {level.acesToNextLevel} Aces
        </Text>
        <Text className="text-xs font-sans text-label-secondary">
          {progressPercent.toFixed(0)}%
        </Text>
      </View>
    </Card>
  );
}
