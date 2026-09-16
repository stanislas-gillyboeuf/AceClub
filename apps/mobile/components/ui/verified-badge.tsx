import { BadgeCheck } from "lucide-react-native";
import { colors } from "@/constants/theme";

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
}

/** Small checkmark shown next to a skill level once a club admin has confirmed it. */
export function VerifiedBadge({ size = 14, color = colors.accentGreen }: VerifiedBadgeProps) {
  return <BadgeCheck size={size} color={color} strokeWidth={2.5} />;
}
