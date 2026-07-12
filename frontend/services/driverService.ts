import { apiDelete, apiGet, apiPatch, apiPost } from "@/libs/api";
import type { Driver, DriverInput, DriverStatus } from "@/types/driver";
import type { ListParams } from "@/app/_hooks/usePaginatedList";
import { emptyPage, type PaginatedResult } from "./types";

export interface DriverListParams extends ListParams {
  status?: DriverStatus;
}

export async function listDrivers(
  params: DriverListParams = {},
): Promise<PaginatedResult<Driver>> {
  const res = await apiGet<PaginatedResult<Driver>>("/drivers", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  if (!res.data) throw new Error(res.error ?? "Failed to load drivers.");
  return res.data;
}

export async function listAllDrivers(): Promise<Driver[]> {
  const res = await listDrivers({ limit: 100 });
  return res.data;
}

export async function listDispatchEligibleDrivers(): Promise<Driver[]> {
  const res = await apiGet<Driver[]>("/drivers/dispatch-eligible");
  if (!res.data) throw new Error(res.error ?? "Failed to load eligible drivers.");
  return res.data;
}

export async function getDriver(id: string): Promise<Driver | null> {
  const res = await apiGet<Driver>(`/drivers/${id}`);
  return res.data;
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const res = await apiPost<Driver>("/drivers", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create driver.");
  return res.data;
}

export async function updateDriver(
  id: string,
  input: Partial<DriverInput>,
): Promise<Driver> {
  const res = await apiPatch<Driver>(`/drivers/${id}`, input);
  if (!res.data) throw new Error(res.error ?? "Failed to update driver.");
  return res.data;
}

export async function deleteDriver(id: string): Promise<void> {
  const res = await apiDelete(`/drivers/${id}`);
  if (res.error) throw new Error(res.error);
}
