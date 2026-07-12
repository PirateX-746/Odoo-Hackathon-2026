import { apiGet, apiPost } from "@/libs/api";
import type { CreateMaintenanceInput, MaintenanceLog, MaintenanceStatus } from "@/types/maintenance";
import type { ListParams } from "@/app/_hooks/usePaginatedList";
import type { PaginatedResult } from "./types";

export interface MaintenanceListParams extends ListParams {
  vehicleId?: string;
  status?: MaintenanceStatus;
}

export async function listMaintenanceLogs(
  params: MaintenanceListParams = {},
): Promise<PaginatedResult<MaintenanceLog>> {
  const res = await apiGet<PaginatedResult<MaintenanceLog>>("/maintenance", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  if (!res.data) throw new Error(res.error ?? "Failed to load maintenance logs.");
  return res.data;
}

export async function listMaintenanceForVehicle(vehicleId: string): Promise<MaintenanceLog[]> {
  const res = await apiGet<MaintenanceLog[]>(`/maintenance/vehicle/${vehicleId}`);
  if (!res.data) throw new Error(res.error ?? "Failed to load maintenance logs.");
  return res.data;
}

export async function getMaintenanceLog(id: string): Promise<MaintenanceLog | null> {
  const res = await apiGet<MaintenanceLog>(`/maintenance/${id}`);
  return res.data;
}

export async function createMaintenanceLog(input: CreateMaintenanceInput): Promise<MaintenanceLog> {
  const res = await apiPost<MaintenanceLog>("/maintenance", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create maintenance log.");
  return res.data;
}

export async function closeMaintenanceLog(id: string): Promise<MaintenanceLog> {
  const res = await apiPost<MaintenanceLog>(`/maintenance/${id}/close`, {});
  if (!res.data) throw new Error(res.error ?? "Failed to close maintenance log.");
  return res.data;
}
