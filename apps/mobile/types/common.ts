export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CursorPagination {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export type Sport = "tennis" | "padel";

export type MemberRole = "owner" | "admin" | "member";
