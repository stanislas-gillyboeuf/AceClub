import {
  Shield,
  Swords,
  Crown,
  Star,
  Flame,
  type LucideIcon,
} from "lucide-react-native";

export interface LevelTier {
  icon: LucideIcon;
  color: string;
  label: string;
}

const tiers: { maxLevel: number; tier: LevelTier }[] = [
  { maxLevel: 3, tier: { icon: Shield, color: "#8B5CF6", label: "Débutant" } },
  { maxLevel: 5, tier: { icon: Swords, color: "#3B82F6", label: "Intermédiaire" } },
  { maxLevel: 7, tier: { icon: Crown, color: "#F59E0B", label: "Avancé" } },
  { maxLevel: 9, tier: { icon: Star, color: "#EF4444", label: "Expert" } },
  { maxLevel: Infinity, tier: { icon: Flame, color: "#EC4899", label: "Élite" } },
];

export function getLevelTier(level: number): LevelTier {
  for (const entry of tiers) {
    if (level <= entry.maxLevel) return entry.tier;
  }
  return tiers[tiers.length - 1].tier;
}
