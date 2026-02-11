import { View, Text, Pressable } from "@/tw";
import type { UserLevel } from "@/types/level";

interface LevelProgressCardProps {
  userLevel: UserLevel;
  onPress?: () => void;
}

export function LevelProgressCard({
  userLevel,
  onPress,
}: LevelProgressCardProps) {
  const progressPercent = Math.min(userLevel.progressPercent, 1);
  const isMaxLevel = userLevel.level >= 100;

  const formattedTotalAces =
    userLevel.totalAces >= 1000
      ? `${(userLevel.totalAces / 1000).toFixed(1)}k Aces`
      : `${userLevel.totalAces} Aces`;

  const formattedProgress = `${userLevel.currentLevelAces}/${userLevel.currentLevelAces + userLevel.acesToNextLevel} Aces`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-lg border-[0.5px] border-border dark:border-border-dark">
        {/* Header row */}
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
              Niveau {userLevel.level}
            </Text>
            <Text className="text-sm font-sans text-label-secondary">
              {formattedTotalAces} total
            </Text>
          </View>

          {/* Level badge circle */}
          <View className="w-16 h-16 rounded-full bg-primary/15 dark:bg-primary-dark/15 items-center justify-center border-[3px] border-primary dark:border-primary-dark">
            <Text className="text-2xl font-sans-bold text-primary dark:text-primary-dark">
              {userLevel.level}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {!isMaxLevel && (
          <View className="mt-4 gap-2">
            <View className="h-3 rounded-md bg-bg-secondary dark:bg-bg-secondary-dark overflow-hidden">
              <View
                className="h-full rounded-md bg-primary dark:bg-primary-dark"
                style={{ width: `${progressPercent * 100}%` }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-sans text-label-secondary">
                {formattedProgress}
              </Text>
              <Text className="text-xs font-sans-medium text-primary dark:text-primary-dark">
                Niveau {userLevel.level + 1}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
