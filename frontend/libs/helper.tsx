import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  RETRY_AFTER_DEFAULT,
} from "@/libs/constant";

// ─── Token helpers ───────────────────────────────────────────────────────
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${ACCESS_TOKEN_KEY}=`))
      ?.split("=")[1] ?? null
  );
};

export const removeTokens = (): void => {
  if (typeof window === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_KEY}=; Max-Age=0; path=/`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; Max-Age=0; path=/`;
};

// ─── Pagination helpers ──────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export const buildQueryString = (params: PaginationParams): string => {
  const resolved: Record<string, string> = {
    page: String(params.page ?? DEFAULT_PAGE),
    page_size: String(params.pageSize ?? DEFAULT_PAGE_SIZE),
  };
  if (params.search) resolved.search = params.search;

  // Pass through any extra filters
  Object.entries(params).forEach(([k, v]) => {
    if (!["page", "pageSize", "search"].includes(k) && v !== undefined) {
      resolved[k] = String(v);
    }
  });

  return new URLSearchParams(resolved).toString();
};

// ─── Rate-limit helper ───────────────────────────────────────────────────
export const getRetryAfterSeconds = (headers: Headers): number => {
  const raw = headers.get("Retry-After");
  if (!raw) return RETRY_AFTER_DEFAULT;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? RETRY_AFTER_DEFAULT : parsed;
};

// ─── Error helpers ───────────────────────────────────────────────────────
export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "An unexpected error occurred.";
};

// ─── String / formatting ─────────────────────────────────────────────────
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (str: string, max = 100): string =>
  str.length > max ? `${str.slice(0, max)}…` : str;

export const formatDate = (
  dateStr: string | Date,
  locale = "en-IN",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  },
): string => new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
