export interface Event {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string | null;
  type: string;
  sport: "tennis" | "padel" | null;
  startAt: string;
  endAt: string | null;
  location: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  status: "draft" | "published" | "cancelled" | "completed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean;
}

export interface EventParticipant {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  registeredAt: string;
}

export interface CreateEventData {
  organizationId: string;
  title: string;
  description?: string;
  type: string;
  sport?: "tennis" | "padel";
  startAt: string;
  endAt?: string;
  location?: string;
  maxParticipants?: number;
}
