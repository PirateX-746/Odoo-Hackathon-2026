import { apiGet } from "@/libs/api";

// Matches the backend's InsightsSummaryDto exactly (insights/dto/insights-summary.dto.ts).
export interface InsightsSummary {
  headline: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface InsightsSummaryParams {
  region?: string;
  type?: string;
  status?: string;
}

export async function getInsightsSummary(
  params: InsightsSummaryParams = {},
): Promise<InsightsSummary> {
  const res = await apiGet<InsightsSummary>("/insights/summary", {
    params: params as Record<string, string | undefined>,
  });
  if (!res.data) throw new Error(res.error ?? "Failed to load insights summary.");
  return res.data;
}
