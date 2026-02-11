import { View, Text, Pressable } from "@/tw";
import { Minus, Plus } from "lucide-react-native";

interface ScoreStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function ScoreStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: ScoreStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View className="items-center gap-2">
      {label && (
        <Text
          className="text-xs font-sans-medium text-label-secondary"
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            canDecrement
              ? "bg-bg-secondary dark:bg-bg-secondary-dark"
              : "bg-bg-secondary/50 dark:bg-bg-secondary-dark/50"
          }`}
        >
          <Minus size={18} color={canDecrement ? "#8E8E93" : "#C7C7CC"} />
        </Pressable>

        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark font-mono w-12 text-center">
          {value}
        </Text>

        <Pressable
          onPress={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            canIncrement
              ? "bg-primary/15 dark:bg-primary-dark/15"
              : "bg-bg-secondary/50 dark:bg-bg-secondary-dark/50"
          }`}
        >
          <Plus size={18} color={canIncrement ? "#34C759" : "#C7C7CC"} />
        </Pressable>
      </View>
    </View>
  );
}
