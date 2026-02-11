export type BadgeCategory = "level" | "achievement" | "milestone" | "special";

export interface Badge {
  id: string;
  code: string;
  category: BadgeCategory;
  name: string;
  description: string;
  imageUrl: string;
  requiredLevel: number | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface Title {
  id: string;
  code: string;
  name: string;
  requiredLevel: number;
  isEquipped: boolean;
}

export interface TitlesResponse {
  titles: Title[];
  equippedTitleId: string | null;
}
