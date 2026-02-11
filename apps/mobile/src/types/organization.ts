export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
  metadata: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  pinEnabled: boolean;
}

export interface OrganizationSearchResult {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  pinEnabled: boolean;
}

export type MemberRole = "admin" | "member" | "owner";

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface OrganizationStats {
  totalMembers: number;
  matchesThisMonth: number;
  activeMembers: number;
  activityRate: number;
}

export interface FullOrganization extends Organization {
  members: Member[];
}
