// Matches the backend's Prisma Trip model exactly (backend/prisma/schema.prisma).
// Trips are a dispatch workflow, not free CRUD: DRAFT -> dispatch -> DISPATCHED
// -> complete/cancel -> COMPLETED/CANCELLED. There is no generic update/delete.
export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm: number | null;
  startOdometerKm: number | null;
  endOdometerKm: number | null;
  fuelConsumedLiters: number | null;
  revenue: number | null;
  status: TripStatus;
  dispatchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
}

export interface CompleteTripInput {
  endOdometerKm: number;
  fuelConsumedLiters: number;
  revenue?: number;
}
