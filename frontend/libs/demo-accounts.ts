import { ROLES } from "@/libs/constant";

// Real accounts seeded into the backend by prisma/seed.ts — every seeded
// user shares the same password. Shown on the login screen so evaluators
// can sign in without knowing the seed data by heart.
export const DEMO_ACCOUNTS = [
  { email: "admin@transitops.dev", password: "Password123!", role: ROLES.ADMIN },
  {
    email: "fleet.manager@transitops.dev",
    password: "Password123!",
    role: ROLES.FLEET_MANAGER,
  },
  {
    email: "safety.officer@transitops.dev",
    password: "Password123!",
    role: ROLES.SAFETY_OFFICER,
  },
  {
    email: "finance.analyst@transitops.dev",
    password: "Password123!",
    role: ROLES.FINANCIAL_ANALYST,
  },
  { email: "driver.demo@transitops.dev", password: "Password123!", role: ROLES.DRIVER },
] as const;
