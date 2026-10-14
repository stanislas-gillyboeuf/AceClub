import { BadgeCheck } from "lucide-react-native";
import { semanticColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
}

/** Small checkmark shown next to a skill level once a club admin has confirmed it. */
export function VerifiedBadge({ size = 14, color }: VerifiedBadgeProps) {
  const scheme = useColorScheme();
  return <BadgeCheck size={size} color={color ?? semanticColors.accentGreen[scheme]} strokeWidth={2.5} />;
}
