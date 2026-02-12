export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  onboardingCompleted: boolean;
  phoneNumber: string | null;
}

export interface UserPreferences {
  id: string;
  userId: string;
  organizationId: string | null;
  organizationName: string | null;
  sport: "tennis" | "padel";
  skillLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export const TENNIS_LEVELS = [
  "Négatif",
  "-4/6",
  "-2/6",
  "0",
  "1/6",
  "2/6",
  "3/6",
  "4/6",
  "5/6",
  "15",
  "15/1",
  "15/2",
  "15/3",
  "15/4",
  "15/5",
  "30",
  "30/1",
  "30/2",
  "30/3",
  "30/4",
  "30/5",
  "40",
  "NC",
] as const;

export const PADEL_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const;

export type Sport = "tennis" | "padel";

export interface CompleteOnboardingData {
  organizationId: string;
  sport: Sport;
  skillLevel: string;
  phoneNumber: string;
  imageUrl?: string;
  pin?: string;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
  phoneNumber?: string;
  organizationId?: string;
  sport?: Sport;
  skillLevel?: string;
  pin?: string;
}
