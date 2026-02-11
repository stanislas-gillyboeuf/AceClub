export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    onboardingCompleted: boolean | null;
  };
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}
