import { View, Text, Pressable } from "@/tw";
import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import type { Badge } from "@/types/reward";

interface BadgeGridProps {
  badges: Badge[];
  onBadgePress?: (badge: Badge) => void;
}

export function BadgeGrid({ badges, onBadgePress }: BadgeGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {badges.map((badge) => (
        <Pressable
          key={badge.id}
          onPress={() => onBadgePress?.(badge)}
          className="items-center"
          style={{ width: 72 }}
        >
          <View className="w-14 h-14 rounded-full items-center justify-center overflow-hidden bg-bg-secondary dark:bg-bg-secondary-dark">
            {badge.imageUrl ? (
              <Image
                source={{ uri: badge.imageUrl }}
                style={{ width: 56, height: 56 }}
                contentFit="cover"
              />
            ) : (
              <Lock size={24} color="#8E8E93" />
            )}
            {!badge.isUnlocked && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-full">
                <Lock size={18} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text
            className="text-[10px] font-sans text-label-secondary mt-1 text-center"
            numberOfLines={2}
          >
            {badge.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
