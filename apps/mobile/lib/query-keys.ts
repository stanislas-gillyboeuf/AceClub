import type { QueryKey } from "@tanstack/react-query";

function root<const T extends string>(domain: T): readonly [T] {
  return [domain] as const;
}

export const queryKeys = {
  match: (() => {
    const all = root("match");
    return {
      all,
      lists: () => [...all, "list"] as const,
      list: (params?: unknown) => [...all, "list", params] as const,
      infinite: (params?: unknown) => [...all, "infinite", params] as const,
      infiniteAll: () => [...all, "infinite"] as const,
      detail: (id: string) => [...all, id] as const,
    };
  })(),

  event: (() => {
    const all = root("event");
    return {
      all,
      myEvents: (params?: unknown) => [...all, "my-events", params] as const,
      myEventsAll: () => [...all, "my-events"] as const,
      infinite: (params?: unknown) => [...all, "infinite", params] as const,
      infiniteAll: () => [...all, "infinite"] as const,
      adminList: (params?: unknown) => [...all, "admin-list", params] as const,
      adminListAll: () => [...all, "admin-list"] as const,
      detail: (id: string) => [...all, id] as const,
    };
  })(),

  user: (() => {
    const all = root("user");
    return {
      all,
      me: () => [...all, "me"] as const,
      preferences: () => [...all, "preferences"] as const,
      search: (query: string, limit: number) => [...all, "search", query, limit] as const,
      searchAll: () => [...all, "search"] as const,
    };
  })(),

  conversation: (() => {
    const all = root("conversation");
    return {
      all,
      list: () => [...all, "list"] as const,
      detail: (id: string) => [...all, id] as const,
      messages: (conversationId: string, params?: unknown) =>
        [...all, conversationId, "messages", params] as const,
      messagesAll: (conversationId: string) => [...all, conversationId, "messages"] as const,
    };
  })(),

  invitation: (() => {
    const all = root("invitation");
    return {
      all,
      list: (params?: unknown) => [...all, "list", params] as const,
      listAll: () => [...all, "list"] as const,
      detail: (id: string) => [...all, id] as const,
    };
  })(),

  leaderboard: (() => {
    const all = root("leaderboard");
    return {
      all,
      global: (page: number, limit: number) => [...all, "global", page, limit] as const,
      globalInfinite: (limit: number) => [...all, "global", "infinite", limit] as const,
      organization: (organizationId: string, page: number, limit: number) =>
        [...all, "organization", organizationId, page, limit] as const,
      organizationInfinite: (organizationId: string, limit: number) =>
        [...all, "organization", "infinite", organizationId, limit] as const,
      weekly: (page: number, limit: number) => [...all, "weekly", page, limit] as const,
      weeklyInfinite: (limit: number) => [...all, "weekly", "infinite", limit] as const,
    };
  })(),

  organization: (() => {
    const all = root("organization");
    return {
      all,
      list: () => [...all, "list"] as const,
      user: (userId: string) => [...all, "user", userId] as const,
      search: (query: string | undefined, limit: number, offset: number) =>
        [...all, "search", query, limit, offset] as const,
      full: (slug: string) => [...all, "full", slug] as const,
      stats: (organizationId: string) => [...all, "stats", organizationId] as const,
      activeMember: () => [...all, "active-member"] as const,
      activeMemberRole: () => [...all, "active-member-role"] as const,
      members: (organizationId?: string) => [...all, "members", organizationId] as const,
      membersAll: () => [...all, "members"] as const,
      pin: (organizationId: string) => [...all, "pin", organizationId] as const,
    };
  })(),

  matchIntent: (() => {
    const all = root("match-intent");
    return {
      all,
      list: (cursor?: string, limit?: number) => [...all, "list", cursor, limit] as const,
      listAll: () => [...all, "list"] as const,
      discover: (params?: unknown) => [...all, "discover", params] as const,
      discoverAll: () => [...all, "discover"] as const,
      requests: () => [...all, "requests"] as const,
      detail: (id: string) => [...all, id] as const,
    };
  })(),

  reward: (() => {
    const all = root("reward");
    return {
      all,
      myBadges: () => [...all, "my-badges"] as const,
      allBadges: () => [...all, "all-badges"] as const,
      myTitles: () => [...all, "my-titles"] as const,
    };
  })(),

  challenge: (() => {
    const all = root("challenge");
    return {
      all,
      me: () => [...all, "me"] as const,
      templates: () => [...all, "templates"] as const,
    };
  })(),

  streak: (() => {
    const all = root("streak");
    return {
      all,
      me: () => [...all, "me"] as const,
    };
  })(),

  level: (() => {
    const all = root("level");
    return {
      all,
      me: () => [...all, "me"] as const,
      user: (userId: string) => [...all, userId] as const,
      acesHistory: (page: number, limit: number) => [...all, "aces-history", page, limit] as const,
    };
  })(),

  admin: (() => {
    const all = root("admin");
    return {
      all,
      users: () => [...all, "users"] as const,
      sessions: (userId: string) => [...all, "sessions", userId] as const,
    };
  })(),

  court: (() => {
    const all = root("court");
    return {
      all,
      list: (organizationId?: string) => [...all, "list", organizationId] as const,
      availability: (courtId?: string, date?: string) =>
        [...all, "availability", courtId, date] as const,
      availabilityAll: () => [...all, "availability"] as const,
      myBookings: (filter?: string) => [...all, "my-bookings", filter] as const,
      myBookingsAll: () => [...all, "my-bookings"] as const,
      bookingEnabled: (organizationId?: string) =>
        [...all, "booking-enabled", organizationId] as const,
    };
  })(),

  notification: (() => {
    const all = root("notification");
    return {
      all,
      list: (params?: unknown) => [...all, "list", params] as const,
      listAll: () => [...all, "list"] as const,
    };
  })(),
} as const;

export type AppQueryKey = QueryKey;
