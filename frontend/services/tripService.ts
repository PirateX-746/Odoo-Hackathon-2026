import { apiGet, apiPost } from "@/libs/api";
import type { CompleteTripInput, CreateTripInput, Trip, TripStatus } from "@/types/trip";
import type { ListParams } from "@/app/_hooks/usePaginatedList";
import { emptyPage, type PaginatedResult } from "./types";

export interface TripListParams extends ListParams {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
}

export async function listTrips(params: TripListParams = {}): Promise<PaginatedResult<Trip>> {
  const res = await apiGet<PaginatedResult<Trip>>("/trips", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return res.data ?? emptyPage<Trip>();
}

export async function listAllTrips(): Promise<Trip[]> {
  const res = await listTrips({ limit: 100 });
  return res.data;
}

export async function getTrip(id: string): Promise<Trip | null> {
  const res = await apiGet<Trip>(`/trips/${id}`);
  return res.data;
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const res = await apiPost<Trip>("/trips", input);
  if (!res.data) throw new Error(res.error ?? "Failed to create trip.");
  return res.data;
}

export async function dispatchTrip(id: string): Promise<Trip> {
  const res = await apiPost<Trip>(`/trips/${id}/dispatch`, {});
  if (!res.data) throw new Error(res.error ?? "Failed to dispatch trip.");
  return res.data;
}

export async function completeTrip(id: string, input: CompleteTripInput): Promise<Trip> {
  const res = await apiPost<Trip>(`/trips/${id}/complete`, input);
  if (!res.data) throw new Error(res.error ?? "Failed to complete trip.");
  return res.data;
}

export async function cancelTrip(id: string): Promise<Trip> {
  const res = await apiPost<Trip>(`/trips/${id}/cancel`, {});
  if (!res.data) throw new Error(res.error ?? "Failed to cancel trip.");
  return res.data;
}
