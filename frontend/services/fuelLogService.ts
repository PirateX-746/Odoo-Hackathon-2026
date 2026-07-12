import { apiDelete, apiGet, apiPatch, apiPost } from "@/libs/api";
import type { FuelLog, FuelLogInput } from "@/types/fuelLog";
import type { ListParams } from "@/app/_hooks/usePaginatedList";
import type { PaginatedResult } from "./types";

export interface FuelLogListParams extends ListParams {
  vehicleId?: string;
  tripId?: string;
}

export async function listFuelLogs(
  params: FuelLogListParams = {},
): Promise<PaginatedResult<FuelLog>> {
  const res = await apiGet<PaginatedResult<FuelLog>>("/fuel-logs", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  if (!res.data) throw new Error(res.error ?? "Failed to load fuel logs.");
  return res.data;
}

export async function listFuelLogsForVehicle(vehicleId: string): Promise<FuelLog[]> {
  const res = await apiGet<FuelLog[]>(`/fuel-logs/vehicle/${vehicleId}`);
  if (!res.data) throw new Error(res.error ?? "Failed to load fuel logs.");
  return res.data;
}

export async function getFuelLog(id: string): Promise<FuelLog | null> {
  const res = await apiGet<FuelLog>(`/fuel-logs/${id}`);
  return res.data;
}

export async function createFuelLog(input: FuelLogInput): Promise<FuelLog> {
  const res = await apiPost<FuelLog>("/fuel-logs", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create fuel log.");
  return res.data;
}

export async function updateFuelLog(id: string, input: Partial<FuelLogInput>): Promise<FuelLog> {
  const res = await apiPatch<FuelLog>(`/fuel-logs/${id}`, input);
  if (!res.data) throw new Error(res.error ?? "Failed to update fuel log.");
  return res.data;
}

export async function deleteFuelLog(id: string): Promise<void> {
  const res = await apiDelete(`/fuel-logs/${id}`);
  if (res.error) throw new Error(res.error);
}
