import { Dumbbell } from "lucide-react-native";
import { SectionCard } from "@/components/ui/section-card";
import { RadioGroup } from "@/components/ui/radio-group";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { semanticColors } from "@/constants/theme";
import { getSkillLevels } from "@/lib/skill-levels";
import type { Sport } from "@/types/common";

const SPORT_LABELS: Record<Sport, string> = { tennis: "Tennis", padel: "Padel" };

interface SportLevelSectionProps {
  sports: Sport[];
  onToggleSport: (sport: Sport) => void;
  skillLevels: Partial<Record<Sport, string>>;
  onSkillLevelChange: (sport: Sport, value: string) => void;
  scheme: "light" | "dark";
}

export function SportLevelSection({
  sports,
  onToggleSport,
  skillLevels,
  onSkillLevelChange,
  scheme,
}: SportLevelSectionProps) {
  return (
    <>
      <SectionCard title="Sport(s) pratiqué(s)">
        <CheckboxGroup<Sport>
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
          selected={sports}
          onToggle={onToggleSport}
        />
      </SectionCard>

      {sports.map((sport) => {
        const levels = getSkillLevels(sport);
        if (levels.length === 0) return null;
        return (
          <SectionCard key={sport} title={`Niveau ${SPORT_LABELS[sport]}`}>
            <RadioGroup<string>
              options={levels.map((l) => ({ value: l.value, label: l.displayName }))}
              selected={skillLevels[sport] ?? null}
              onSelect={(value) => onSkillLevelChange(sport, value)}
            />
          </SectionCard>
        );
      })}
    </>
  );
}
