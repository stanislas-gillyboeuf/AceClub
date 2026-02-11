import { View, Text } from "@/tw";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-horizontal py-16">
      <Icon size={48} color="#8E8E93" strokeWidth={1.5} />
      <Text className="text-lg font-sans-semibold text-label-primary dark:text-label-primary-dark mt-4 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm font-sans text-label-secondary mt-2 text-center max-w-[280px]">
          {description}
        </Text>
      )}
    </View>
  );
}
