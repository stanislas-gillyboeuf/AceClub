import type { MemberRole } from "./common";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: string;
  metadata?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pinEnabled: boolean;
}

export interface FullOrganization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: string;
  metadata?: string | null;
  members: Member[];
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

export interface ActiveMember {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
}

export interface ListMembersResponse {
  members: Member[];
}

export interface SearchOrganizationsResponse {
  organizations: Organization[];
  total: number;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: string | null;
}

export interface UpdateOrganizationRequest {
  organizationId: string;
  data: {
    name?: string | null;
    slug?: string | null;
    logo?: string | null;
    address?: string | null;
  };
}

export interface OrganizationPin {
  pin: string;
  enabled: boolean;
}

export interface OrganizationStats {
  totalMembers: number;
  totalMatches: number;
  totalMatchesThisWeek: number;
  activeMembers: number;
}

export interface ClubRequestResponse {
  id: string;
  status: string;
  message?: string;
}
