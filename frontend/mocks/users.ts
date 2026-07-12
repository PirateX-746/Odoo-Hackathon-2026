import { ROLES } from "@/libs/constant";
import type { User } from "@/types/user";
import { daysAgo } from "./date-helpers";

// Mirrors prisma/seed.ts's real accounts (same names/emails/roles) so the
// mock Users list reads consistently with who can actually log in. This
// page itself still isn't wired to the real GET /users endpoint — only
// auth is live so far.
export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Ava Administrator",
    email: "admin@transitops.dev",
    role: ROLES.ADMIN,
    status: "ACTIVE",
    createdAt: daysAgo(410),
  },
  {
    id: "u2",
    name: "Frank Fleetwood",
    email: "fleet.manager@transitops.dev",
    role: ROLES.FLEET_MANAGER,
    status: "ACTIVE",
    createdAt: daysAgo(365),
  },
  {
    id: "u3",
    name: "Sofia Sentinel",
    email: "safety.officer@transitops.dev",
    role: ROLES.SAFETY_OFFICER,
    status: "ACTIVE",
    createdAt: daysAgo(280),
  },
  {
    id: "u4",
    name: "Felix Numbers",
    email: "finance.analyst@transitops.dev",
    role: ROLES.FINANCIAL_ANALYST,
    status: "ACTIVE",
    createdAt: daysAgo(190),
  },
  {
    id: "u5",
    name: "Alex Carter",
    email: "driver.demo@transitops.dev",
    role: ROLES.DRIVER,
    status: "ACTIVE",
    createdAt: daysAgo(120),
  },
];
