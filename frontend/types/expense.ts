// Matches the backend's Prisma Expense model exactly (backend/prisma/schema.prisma).
export type ExpenseType = "TOLL" | "MAINTENANCE" | "OTHER";

export interface Expense {
  id: string;
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
}
