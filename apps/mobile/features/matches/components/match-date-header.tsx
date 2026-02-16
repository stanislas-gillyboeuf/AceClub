import { DateSectionHeader } from "@/components/ui/date-section-header";
import { BadgePill } from "@/components/ui/badge-pill";
import { colors } from "@/constants/theme";
import { formatLongDate } from "@/lib/date";

interface MatchDateHeaderProps {
  date: Date;
  isToday: boolean;
}

export function MatchDateHeader({ date, isToday }: MatchDateHeaderProps) {
  return (
    <DateSectionHeader
      title={formatLongDate(date)}
      dotColor={isToday ? colors.accentGreen : undefined}
      titleColor={isToday ? colors.accentGreen : undefined}
      trailing={
        isToday ? <BadgePill label="Aujourd'hui" variant="success" /> : undefined
      }
    />
  );
}
