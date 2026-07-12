import { apiGet } from "@/libs/api";

// Matches the backend's DashboardKpisDto exactly (dashboard/dto/dashboard-kpis.dto.ts).
export interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPercent: number;
}

export interface DashboardKpisParams {
  region?: string;
  type?: string;
  status?: string;
}

export async function getDashboardKpis(params: DashboardKpisParams = {}): Promise<DashboardKpis | null> {
  const res = await apiGet<DashboardKpis>("/dashboard/kpis", {
    params: params as Record<string, string | undefined>,
  });
  return res.data;
}
