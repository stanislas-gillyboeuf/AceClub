import { Dumbbell } from "lucide-react-native";
import { SectionCard } from "@/components/ui/section-card";
import { RadioGroup } from "@/components/ui/radio-group";
import { semanticColors } from "@/constants/theme";
import { getSkillLevels } from "@/lib/skill-levels";
import type { Sport } from "@/types/common";

interface SportLevelSectionProps {
  sport: Sport | null;
  onSportChange: (sport: Sport) => void;
  skillLevel: string | null;
  onSkillLevelChange: (value: string) => void;
  scheme: "light" | "dark";
}

export function SportLevelSection({
  sport,
  onSportChange,
  skillLevel,
  onSkillLevelChange,
  scheme,
}: SportLevelSectionProps) {
  const skillLevels = sport ? getSkillLevels(sport) : [];

  return (
    <>
      <SectionCard title="Sport">
        <RadioGroup<Sport>
          options={[
            {
              value: "tennis",
              label: "Tennis",
              icon: <Dumbbell size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />,
            },
            {
              value: "padel",
              label: "Padel",
              icon: <Dumbbell size={20} color={semanticColors.labelSecondary[scheme]} strokeWidth={1.5} />,
            },
          ]}
          selected={sport}
          onSelect={onSportChange}
        />
      </SectionCard>

      {sport && skillLevels.length > 0 && (
        <SectionCard title="Niveau">
          <RadioGroup<string>
            options={skillLevels.map((l) => ({
              value: l.value,
              label: l.displayName,
            }))}
            selected={skillLevel}
            onSelect={onSkillLevelChange}
          />
        </SectionCard>
      )}
    </>
  );
}
