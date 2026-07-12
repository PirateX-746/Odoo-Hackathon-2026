"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "@/libs/constant";
import type { PaginatedResult } from "@/services/types";

// Query param names match the backend's PaginationQueryDto exactly, since
// these get passed straight through as fetch query params — the backend
// does the filtering/sorting/paging, not the client.
export interface ListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

// Pass a stable, module-level service function (e.g. listVehicles) as
// fetcher — an inline arrow function would change identity every render
// and cause a refetch loop.
export function usePaginatedList<T, P extends ListParams = ListParams>(
  fetcher: (params: P) => Promise<PaginatedResult<T>>,
  initialParams: Partial<P> = {},
) {
  const [params, setParams] = useState<ListParams>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    ...initialParams,
  });
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const res = await fetcher(params as P);
    setData(res.data);
    setTotal(res.meta.total);
    setPageCount(res.meta.totalPages);
    setLoading(false);
  }, [fetcher, params]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateParams = (patch: Partial<ListParams>) =>
    setParams((prev) => ({ ...prev, page: DEFAULT_PAGE, ...patch }));

  const goToPage = (page: number) => setParams((prev) => ({ ...prev, page }));

  return {
    data,
    total,
    loading,
    params,
    page: params.page ?? DEFAULT_PAGE,
    pageCount,
    updateParams,
    goToPage,
    refetch,
  };
}
