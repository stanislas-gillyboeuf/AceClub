import { View, Text } from "@/tw";
import { Flame, Trophy, Zap } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import type { UserStreak } from "@/types/streak";

interface StreakCardProps {
  streak: UserStreak;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card className="p-card">
      <Text className="text-base font-sans-semibold text-label-primary dark:text-label-primary-dark mb-3">
        Série d'activité
      </Text>

      <View className="flex-row gap-3">
        <View className="flex-1 items-center bg-accent-orange/10 rounded-md py-3">
          <Flame size={20} color="#FF9500" />
          <Text className="text-xl font-sans-bold text-label-primary dark:text-label-primary-dark mt-1">
            {streak.currentStreak}
          </Text>
          <Text className="text-xs font-sans text-label-secondary">
            Semaine{streak.currentStreak !== 1 ? "s" : ""}
          </Text>
        </View>

        <View className="flex-1 items-center bg-primary/10 dark:bg-primary-dark/10 rounded-md py-3">
          <Trophy size={20} color="#34C759" />
          <Text className="text-xl font-sans-bold text-label-primary dark:text-label-primary-dark mt-1">
            {streak.longestStreak}
          </Text>
          <Text className="text-xs font-sans text-label-secondary">
            Record
          </Text>
        </View>

        <View className="flex-1 items-center bg-blue-500/10 rounded-md py-3">
          <Zap size={20} color="#007AFF" />
          <Text className="text-xl font-sans-bold text-label-primary dark:text-label-primary-dark mt-1">
            x{streak.multiplier.toFixed(1)}
          </Text>
          <Text className="text-xs font-sans text-label-secondary">
            Multiplicateur
          </Text>
        </View>
      </View>
    </Card>
  );
}
