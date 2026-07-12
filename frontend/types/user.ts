import type { Role } from "@/libs/constant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  avatarUrl?: string;
  createdAt: string;
}

// Matches the backend's AuthUserDto exactly (auth/dto/token-pair.dto.ts) —
// the login/refresh responses carry no display name, only id/email/role.
export interface Session {
  id: string;
  email: string;
  role: Role;
}
