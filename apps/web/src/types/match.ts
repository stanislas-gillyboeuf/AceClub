export interface Match {
  id: string;
  organizationId: string;
  createdBy: string;
  type: string;
  status: "scheduled" | "ongoing" | "finished";
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  venue: MatchVenue | null;
  participants: MatchParticipant[];
  sets: MatchSet[];
  comments: MatchComment[];
  feedback: MatchFeedback[];
}

export interface MatchVenue {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MatchParticipant {
  id: string;
  matchId: string;
  userId: string;
  side: "home" | "away";
  isWinner: boolean | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

export interface MatchSetScore {
  participantId: string;
  userId: string;
  side: "home" | "away";
  games: number;
}

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  createdAt: string;
  scores: MatchSetScore[];
}

export interface MatchComment {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Raw shape returned by GET /api/match/:id */
export interface MatchDetailResponse {
  match: {
    id: string;
    organizationId: string;
    createdBy: string;
    type: string;
    status: "scheduled" | "ongoing" | "finished";
    scheduledAt: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    venueOrganizationId: string | null;
  };
  participants: MatchParticipant[];
  sets: MatchSet[];
  comments: {
    id: string;
    matchId: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: { id: string; name: string; email: string; image: string | null } | null;
  }[];
  myFeedback: {
    id: string;
    userId: string;
    sensation: string;
    comment: string | null;
    createdAt: string;
  } | null;
  venueOrganization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  participantOrganizations: {
    userId: string;
    organization: { id: string; name: string; logo: string | null };
  }[];
}

export interface MatchFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface MatchListItem {
  id: string;
  sport?: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  participants: MatchParticipant[];
  sets: MatchSet[];
  venue: { name: string } | null;
}

export interface MatchIntentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  level: number;
  organization: { id: string; name: string; logo: string | null } | null;
}

export interface MatchIntent {
  id: string;
  userId: string;
  type: string;
  date: string | null;
  time: string | null;
  duration: number | null;
  description: string | null;
  status: string;
  createdAt: string;
  distance?: number | null;
  user?: MatchIntentUser | null;
}

export interface MatchRequest {
  id: string;
  intentId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserImage: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface CreateMatchData {
  createdBy: string;
  status: "scheduled" | "ongoing" | "finished";
  type?: "match" | "training";
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  participants: {
    userId: string;
    side: "home" | "away";
    isWinner?: boolean;
  }[];
  sets?: {
    setNumber: number;
    scores: { userId: string; score: number }[];
  }[];
}

export interface UpdateScoresData {
  sets: {
    setNumber: number;
    scores: { userId: string; score: number }[];
  }[];
}

export interface CreateMatchIntentData {
  sport: "tennis" | "padel";
  type: "simple" | "double";
  message?: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  availableAt: string;
  expiresAt: string;
}
