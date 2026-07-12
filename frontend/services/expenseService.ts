import { apiDelete, apiGet, apiPatch, apiPost } from "@/libs/api";
import type { Expense, ExpenseInput, ExpenseType } from "@/types/expense";
import type { ListParams } from "@/app/_hooks/usePaginatedList";
import type { PaginatedResult } from "./types";

export interface ExpenseListParams extends ListParams {
  vehicleId?: string;
  type?: ExpenseType;
}

export async function listExpenses(
  params: ExpenseListParams = {},
): Promise<PaginatedResult<Expense>> {
  const res = await apiGet<PaginatedResult<Expense>>("/expenses", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  if (!res.data) throw new Error(res.error ?? "Failed to load expenses.");
  return res.data;
}

export async function listExpensesForVehicle(vehicleId: string): Promise<Expense[]> {
  const res = await apiGet<Expense[]>(`/expenses/vehicle/${vehicleId}`);
  if (!res.data) throw new Error(res.error ?? "Failed to load expenses.");
  return res.data;
}

export async function getExpense(id: string): Promise<Expense | null> {
  const res = await apiGet<Expense>(`/expenses/${id}`);
  return res.data;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const res = await apiPost<Expense>("/expenses", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create expense.");
  return res.data;
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<Expense> {
  const res = await apiPatch<Expense>(`/expenses/${id}`, input);
  if (!res.data) throw new Error(res.error ?? "Failed to update expense.");
  return res.data;
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await apiDelete(`/expenses/${id}`);
  if (res.error) throw new Error(res.error);
}
