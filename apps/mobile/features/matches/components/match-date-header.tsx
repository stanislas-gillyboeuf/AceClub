import { DateSectionHeader } from "@/components/ui/date-section-header";
import { BadgePill } from "@/components/ui/badge-pill";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatLongDate } from "@/lib/date";

interface MatchDateHeaderProps {
  date: Date;
  isToday: boolean;
}

export function MatchDateHeader({ date, isToday }: MatchDateHeaderProps) {
  const scheme = useColorScheme();
  return (
    <DateSectionHeader
      title={formatLongDate(date)}
      dotColor={isToday ? semanticColors.accentGreen[scheme] : undefined}
      titleColor={isToday ? semanticColors.accentGreen[scheme] : undefined}
      trailing={
        isToday ? <BadgePill label="Aujourd'hui" variant="success" /> : undefined
      }
    />
  );
}
