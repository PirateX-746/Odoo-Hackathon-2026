import type { Role } from "@/libs/constant";

// Matches the backend's SafeUser exactly (users/users.service.ts) — the
// User model minus passwordHash/refreshTokenHash.
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: Role;
  isActive?: boolean;
}

// Matches the backend's AuthUserDto exactly (auth/dto/token-pair.dto.ts) —
// the login/refresh responses carry no display name, only id/email/role.
export interface Session {
  id: string;
  email: string;
  role: Role;
}
