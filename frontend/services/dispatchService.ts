import { apiGet } from "@/libs/api";

// Matches the backend's DispatchRecommendationsDto exactly
// (dispatch-assistant/dto/dispatch-recommendation.dto.ts).
export interface DispatchRecommendation {
  vehicleId: string;
  driverId: string;
  rationale: string;
  confidenceScore: number;
}

export interface DispatchRecommendationParams {
  source: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  region?: string;
  [key: string]: string | number | undefined;
}

export interface DispatchRecommendationResult {
  recommendations: DispatchRecommendation[];
  error: string | null;
}

export async function getDispatchRecommendations(
  params: DispatchRecommendationParams,
): Promise<DispatchRecommendationResult> {
  const res = await apiGet<{ recommendations: DispatchRecommendation[] }>(
    "/trips/dispatch/recommendations",
    { params: params as Record<string, string | number | boolean | undefined> },
  );
  return { recommendations: res.data?.recommendations ?? [], error: res.error };
}
