// Matches the backend's Prisma FuelLog model exactly (backend/prisma/schema.prisma).
export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  liters: number;
  cost: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLogInput {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date: string;
}
