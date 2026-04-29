export interface PaginatedResponse {
  pagination: {
    page: number;
    totalPages: number;
  };
}

export interface CursorResponse {
  hasMore: boolean;
  nextCursor: string | null;
}

export function getNextPageParamFromPagination<T extends PaginatedResponse>(
  lastPage: T
): number | undefined {
  if (lastPage.pagination.page < lastPage.pagination.totalPages) {
    return lastPage.pagination.page + 1;
  }
  return undefined;
}

export function getNextPageParamFromCursor<T extends CursorResponse>(
  lastPage: T
): string | undefined {
  return lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined;
}
