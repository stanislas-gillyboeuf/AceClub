import { ScrollView, Pressable, Text } from "@/tw";
import type { MatchStatus } from "@/types/match";

interface MatchFilterChipsProps {
  selected: MatchStatus | undefined;
  onChange: (status: MatchStatus | undefined) => void;
}

const filters: { label: string; value: MatchStatus | undefined }[] = [
  { label: "Tous", value: undefined },
  { label: "En cours", value: "ongoing" },
  { label: "Terminés", value: "finished" },
  { label: "Planifiés", value: "scheduled" },
];

export function MatchFilterChips({ selected, onChange }: MatchFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {filters.map((filter) => {
        const isActive = selected === filter.value;
        return (
          <Pressable
            key={filter.label}
            onPress={() => onChange(filter.value)}
            className={`px-4 py-2 rounded-full ${
              isActive
                ? "bg-primary dark:bg-primary-dark"
                : "bg-bg-card dark:bg-bg-card-dark border-[0.5px] border-border dark:border-border-dark"
            }`}
          >
            <Text
              className={`text-sm font-sans-medium ${
                isActive
                  ? "text-white"
                  : "text-label-primary dark:text-label-primary-dark"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
