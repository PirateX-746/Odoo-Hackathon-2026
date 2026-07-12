// Matches the backend's Prisma MaintenanceLog model exactly (backend/prisma/schema.prisma).
export type MaintenanceStatus = "ACTIVE" | "CLOSED";

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: string;
  description: string | null;
  cost: number;
  status: MaintenanceStatus;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Maintenance logs are opened via create and closed via the close action —
// there is no generic update/delete (maintenance/maintenance.controller.ts).
export interface CreateMaintenanceInput {
  vehicleId: string;
  type: string;
  description?: string;
  cost: number;
}
