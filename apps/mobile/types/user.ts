export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  role?: string | null;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  onboardingCompleted?: boolean;
}

export interface UserSearchItem {
  id: string;
  name: string;
  image?: string | null;
  isGhost?: boolean;
}

export interface UserSearchResponse {
  users: UserSearchItem[];
  count: number;
}

export interface GhostUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  isGhost: boolean;
  createdAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  organizationId: string;
  organizationName?: string | null;
  sport: string;
  skillLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteOnboardingRequest {
  name: string;
  organizationId: string;
  sport: string;
  skillLevel: string;
  imageUrl?: string | null;
  pin?: string | null;
}

export interface UpdateProfileRequest {
  name?: string | null;
  image?: string | null;
  organizationId?: string | null;
  sport?: string | null;
  skillLevel?: string | null;
  pin?: string | null;
}

export interface CreateGhostRequest {
  name: string;
  email: string;
}
