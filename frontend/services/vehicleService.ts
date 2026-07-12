import { apiDelete, apiGet, apiPatch, apiPost } from "@/libs/api";
import type { Vehicle, VehicleInput, VehicleStatus } from "@/types/vehicle";
import type { ListParams } from "@/app/_hooks/usePaginatedList";
import { emptyPage, type PaginatedResult } from "./types";

export interface VehicleListParams extends ListParams {
  status?: VehicleStatus;
  region?: string;
  type?: string;
}

export async function listVehicles(
  params: VehicleListParams = {},
): Promise<PaginatedResult<Vehicle>> {
  const res = await apiGet<PaginatedResult<Vehicle>>("/vehicles", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return res.data ?? emptyPage<Vehicle>();
}

export async function listAllVehicles(): Promise<Vehicle[]> {
  const res = await listVehicles({ limit: 100 });
  return res.data;
}

export async function listDispatchEligibleVehicles(): Promise<Vehicle[]> {
  const res = await apiGet<Vehicle[]>("/vehicles/dispatch-eligible");
  return res.data ?? [];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const res = await apiGet<Vehicle>(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const res = await apiPost<Vehicle>("/vehicles", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create vehicle.");
  return res.data;
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleInput>,
): Promise<Vehicle> {
  const res = await apiPatch<Vehicle>(`/vehicles/${id}`, input);
  if (!res.data) throw new Error(res.error ?? "Failed to update vehicle.");
  return res.data;
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await apiDelete(`/vehicles/${id}`);
  if (res.error) throw new Error(res.error);
}
