// Matches the backend's PaginatedResult exactly (common/dto/pagination-query.dto.ts).
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function emptyPage<T>(): PaginatedResult<T> {
  return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
}
