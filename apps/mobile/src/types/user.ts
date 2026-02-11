export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | null;
  image: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  onboardingCompleted: boolean | null;
  phoneNumber: string | null;
  isGhost: boolean | null;
}

export interface UserSummary {
  id: string;
  name: string;
  image: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  image: string | null;
  level: number;
  totalAces: number;
  title: ParticipantTitle | null;
  badges: ParticipantBadge[];
  currentStreak: number;
  longestStreak: number;
  globalRank: number | null;
}

export interface ParticipantTitle {
  code: string;
  nameFr: string;
  nameEn: string;
}

export interface ParticipantBadge {
  code: string;
  imageUrl: string;
  nameFr: string;
  nameEn: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  organizationId: string | null;
  organizationName: string | null;
  sport: string | null;
  skillLevel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
  phoneNumber?: string;
  organizationId?: string;
  sport?: string;
  skillLevel?: string;
  pin?: string;
}

export interface SearchUserResult {
  id: string;
  name: string;
  image: string | null;
  isGhost: boolean;
}

export interface UserMatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export function getUserInitials(name: string): string {
  const components = name.split(" ");
  if (components.length >= 2) {
    return `${components[0][0]}${components[1][0]}`.toUpperCase();
  }
  if (components.length === 1 && components[0].length >= 2) {
    return components[0].substring(0, 2).toUpperCase();
  }
  return "??";
}
