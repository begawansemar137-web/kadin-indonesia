export interface PaginatedResult<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    limit: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
}
