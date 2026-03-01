import { api } from "@/lib/api";
import type {
  EventDetail,
  EventStatus,
  ListEventsResponse,
  MyEvent,
  EventParticipant,
  CreateEventRequest,
  UpdateEventRequest,
  AdminEventItem,
} from "@/types/event";

export const eventService = {
  getEvent: (eventId: string) =>
    api.get<EventDetail>("/event/get", { eventId }),

  listEvents: (params?: {
    organizationId?: string;
    status?: string;
    visibility?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: "upcoming" | "nearest" | "recent";
    latitude?: number;
    longitude?: number;
    cursor?: string;
    limit?: number;
  }) =>
    api.get<ListEventsResponse>("/event/list", params),

  listMyEvents: (params?: {
    status?: string;
    timeFilter?: "upcoming" | "past";
    limit?: number;
    offset?: number;
  }) =>
    api.get<MyEvent[]>("/event/list-my-events", params),

  register: (eventId: string) =>
    api.post<EventParticipant>("/event/register", { eventId }),

  cancelRegistration: (eventId: string) =>
    api.post<{ success: boolean }>("/event/cancel-registration", { eventId }),

  // --- Admin ---

  createEvent: (data: CreateEventRequest) =>
    api.post<AdminEventItem>("/event/create", data),

  adminListEvents: async (params?: {
    status?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const res = await api.get<{ events: AdminEventItem[]; total: number }>(
      "/event/admin-list-events",
      params,
    );
    return res.events;
  },

  updateEvent: (data: UpdateEventRequest) =>
    api.post<{ success: boolean }>("/event/update", data),

  updateEventStatus: (data: { eventId: string; status: EventStatus }) =>
    api.post<{ success: boolean }>("/event/update-status", data),

  deleteEvent: (eventId: string) =>
    api.post<{ success: boolean }>("/event/delete", { eventId }),
};
