import { apiGet, apiPatch, apiPost } from "@/libs/api";
import type { CreateUserInput, UpdateUserInput, User } from "@/types/user";

export async function listUsers(): Promise<User[]> {
  const res = await apiGet<User[]>("/users");
  if (!res.data) throw new Error(res.error ?? "Failed to load users.");
  return res.data;
}

export async function getUser(id: string): Promise<User | null> {
  const res = await apiGet<User>(`/users/${id}`);
  return res.data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await apiPost<User>("/users", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create user.");
  return res.data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const res = await apiPatch<User>(`/users/${id}`, input);
  if (!res.data) throw new Error(res.error ?? "Failed to update user.");
  return res.data;
}
