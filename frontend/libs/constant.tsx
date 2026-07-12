// ─── API ───────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

// ─── App ───────────────────────────────────────────────────────────────────
export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "Transport Operations Platform";

// ─── Auth ──────────────────────────────────────────────────────────────────
export const ACCESS_TOKEN_KEY = "access_token"; // cookie name
export const REFRESH_TOKEN_KEY = "refresh_token"; // cookie name
export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 min before expiry

// ─── Pagination ────────────────────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ─── Rate Limiting (client-side feedback) ─────────────────────────────────
export const RATE_LIMIT_STATUS = 429;
export const RATE_LIMIT_MESSAGE = "Too many requests. Please slow down.";
export const RETRY_AFTER_DEFAULT = 60; // seconds, used when header missing

// ─── HTTP Status ────────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY: 429,
  SERVER_ERROR: 500,
} as const;

// ─── Routes ──────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;

// ─── Permission Groups (generalized) ─────────────────────────────────────
// Replace values with this project's actual permission group identifiers
// once the backend's role/permission model is defined.
export const PERMISSION_GROUPS = {
  SUPER_ADMIN: "SUPER_ADMIN_PERMISSION_GROUP",
  ADMIN: "ADMIN_PERMISSION_GROUP",
  MANAGER: "MANAGER_PERMISSION_GROUP",
  VIEWER: "VIEWER_PERMISSION_GROUP",
} as const;
export type PermissionGroup =
  (typeof PERMISSION_GROUPS)[keyof typeof PERMISSION_GROUPS];
