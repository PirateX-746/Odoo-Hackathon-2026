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
// Query param names match the backend's PaginationQueryDto exactly (page/limit).
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
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
  DASHBOARD: "/",
  VEHICLES: "/vehicles",
  DRIVERS: "/drivers",
  TRIPS: "/trips",
  MAINTENANCE: "/maintenance",
  FUEL: "/fuel",
  EXPENSES: "/expenses",
  USERS: "/users",
} as const;

// ─── Roles ─────────────────────────────────────────────────────────────────
// Mirrors the backend's Prisma `Role` enum exactly (prisma/schema.prisma) —
// keep in sync if the backend adds/renames roles.
export const ROLES = {
  ADMIN: "ADMIN",
  FLEET_MANAGER: "FLEET_MANAGER",
  DRIVER: "DRIVER",
  SAFETY_OFFICER: "SAFETY_OFFICER",
  FINANCIAL_ANALYST: "FINANCIAL_ANALYST",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

// Routes only these roles may see/act on. Absence from this map means
// "every authenticated role can access it". Mirrors the backend's @Roles()
// decorators exactly — /users matches UsersController's class-level
// @Roles(Role.ADMIN) (every user endpoint, including GET, is admin-only).
export const ROUTE_ROLES: Partial<Record<string, Role[]>> = {
  [ROUTES.USERS]: [ROLES.ADMIN],
};

// Per-action permissions — mirrors each backend controller's @Roles()
// decorator on its mutating endpoints exactly (GET endpoints have no
// @Roles and are open to any authenticated user, so there's no
// "CAN_VIEW_*" entry needed here).
export const CAN_MANAGE_VEHICLES: Role[] = [ROLES.ADMIN, ROLES.FLEET_MANAGER];
export const CAN_DELETE_VEHICLES: Role[] = [ROLES.ADMIN];
export const CAN_MANAGE_DRIVERS: Role[] = [
  ROLES.ADMIN,
  ROLES.FLEET_MANAGER,
  ROLES.SAFETY_OFFICER,
];
export const CAN_DELETE_DRIVERS: Role[] = [ROLES.ADMIN];
export const CAN_MANAGE_TRIPS: Role[] = [ROLES.ADMIN, ROLES.FLEET_MANAGER]; // create/dispatch/cancel
export const CAN_COMPLETE_TRIPS: Role[] = [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER];
export const CAN_MANAGE_MAINTENANCE: Role[] = [ROLES.ADMIN, ROLES.FLEET_MANAGER];
export const CAN_MANAGE_FUEL_LOGS: Role[] = [ROLES.ADMIN, ROLES.FLEET_MANAGER];
export const CAN_MANAGE_EXPENSES: Role[] = [
  ROLES.ADMIN,
  ROLES.FLEET_MANAGER,
  ROLES.FINANCIAL_ANALYST,
];
// Mirrors DashboardController's and InsightsController's identical
// class-level @Roles() (backend/src/dashboard/dashboard.controller.ts,
// insights/insights.controller.ts) — unlike most other GET endpoints, these
// are role-restricted server-side (notably: DRIVER is excluded from both).
export const CAN_VIEW_FLEET_ANALYTICS: Role[] = [
  ROLES.ADMIN,
  ROLES.FLEET_MANAGER,
  ROLES.SAFETY_OFFICER,
  ROLES.FINANCIAL_ANALYST,
];

// ─── Domain enums ────────────────────────────────────────────────────────
// All of the below mirror backend/prisma/schema.prisma exactly.
export const VEHICLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  IN_SHOP: "IN_SHOP",
  RETIRED: "RETIRED",
} as const;

export const DRIVER_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  OFF_DUTY: "OFF_DUTY",
  SUSPENDED: "SUSPENDED",
} as const;
export type DriverStatus = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

export const TRIP_STATUS = {
  DRAFT: "DRAFT",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

export const MAINTENANCE_STATUS = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
} as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

export const EXPENSE_TYPE = {
  TOLL: "TOLL",
  MAINTENANCE: "MAINTENANCE",
  OTHER: "OTHER",
} as const;
export type ExpenseType = (typeof EXPENSE_TYPE)[keyof typeof EXPENSE_TYPE];

// Driver licenses within this many days of expiry are flagged as "expiring
// soon" on the dashboard. Vehicles have no document/expiry fields in the
// real schema, so this only ever applies to driver licenses.
export const EXPIRY_WARNING_WINDOW_DAYS = 30;
