import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, RETRY_AFTER_DEFAULT } from "@/libs/constant";

// ─── Token helpers ───────────────────────────────────────────────────────
const readCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
};

export const getAccessToken = (): string | null => readCookie(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => readCookie(REFRESH_TOKEN_KEY);

export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === "undefined") return;
  // Access token drives the 15m session window; refresh token backs the
  // silent-refresh flow and outlives it (7d), matching the backend's
  // JWT_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN.
  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
};

export const removeTokens = (): void => {
  if (typeof window === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_KEY}=; Max-Age=0; path=/`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; Max-Age=0; path=/`;
};

// Decodes a JWT's payload without verifying its signature — safe for
// reading claims client-side (the browser can't verify anyway); the
// backend is the source of truth for actually trusting the token.
export const decodeJwtPayload = <T,>(token: string): T | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
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

// The auth API only returns {id, email, role} — no display name — so derive
// a friendly label from the email's local part (e.g. "fleet.manager" -> "Fleet Manager").
export const getDisplayNameFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join(" ");
};

export const formatDate = (
  dateStr: string | Date,
  locale = "en-IN",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  },
): string => new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
