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
  pin: string | null;
  pinEnabled: boolean;
}

export interface OrganizationFull extends Organization {
  memberCount: number;
  members: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  role: string;
  createdAt: string;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviterId: string;
  inviterName: string | null;
}

export interface OrganizationStats {
  totalMembers: number;
  totalMatches: number;
  totalEvents: number;
  createdAt: string;
}

export interface SearchOrganization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  address: string | null;
  memberCount: number;
}
