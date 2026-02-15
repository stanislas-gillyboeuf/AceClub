export interface Badge {
  id: string;
  code: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  imageUrl: string;
  category: string;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
}

export interface MyBadgesResponse {
  badges: Badge[];
}

export interface AllBadgesResponse {
  badges: Badge[];
}

export interface Title {
  id: string;
  code: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  isEquipped?: boolean;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
}

export interface TitlesResponse {
  titles: Title[];
}

export interface EquipTitleResponse {
  success: boolean;
}
