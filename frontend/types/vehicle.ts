// Matches the backend's Prisma Vehicle model exactly (backend/prisma/schema.prisma).
export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacityKg: number;
  acquisitionCost: number;
  region: string;
  odometerKm?: number;
  status?: VehicleStatus;
}
