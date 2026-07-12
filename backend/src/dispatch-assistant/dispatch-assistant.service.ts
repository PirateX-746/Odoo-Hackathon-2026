import { Injectable } from '@nestjs/common';
import { AnthropicService } from '@/ai/anthropic.service';
import { VehiclesService } from '@/vehicles/vehicles.service';
import { DriversService } from '@/drivers/drivers.service';
import { RecommendDispatchDto } from './dto/recommend-dispatch.dto';
import { DispatchRecommendationsDto } from './dto/dispatch-recommendation.dto';

// Anthropic's structured-output schema validator rejects `maxItems` on array
// types ("property 'maxItems' is not supported") — the "up to 3" cap is
// enforced via the system prompt instead and re-checked in code below.
const RECOMMENDATION_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          vehicleId: { type: 'string' },
          driverId: { type: 'string' },
          rationale: { type: 'string' },
          confidenceScore: { type: 'number' },
        },
        required: ['vehicleId', 'driverId', 'rationale', 'confidenceScore'],
        additionalProperties: false,
      },
    },
  },
  required: ['recommendations'],
  additionalProperties: false,
};

interface RawRecommendations {
  recommendations: Array<{
    vehicleId: string;
    driverId: string;
    rationale: string;
    confidenceScore: number;
  }>;
}

@Injectable()
export class DispatchAssistantService {
  constructor(
    private readonly anthropic: AnthropicService,
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
  ) {}

  async recommend(
    dto: RecommendDispatchDto,
  ): Promise<DispatchRecommendationsDto> {
    const [eligibleVehicles, eligibleDrivers] = await Promise.all([
      this.vehiclesService.findDispatchEligible({ region: dto.region }),
      this.driversService.findDispatchEligible(),
    ]);

    // Deterministic pre-filter: the model only ever sees vehicles that can
    // actually carry the cargo — it cannot recommend an infeasible pairing.
    const candidateVehicles = eligibleVehicles.filter(
      (v) => Number(v.maxLoadCapacityKg) >= dto.cargoWeightKg,
    );

    if (candidateVehicles.length === 0 || eligibleDrivers.length === 0) {
      return { recommendations: [] };
    }

    const raw =
      await this.anthropic.createStructuredCompletion<RawRecommendations>({
        system:
          'You are a dispatch planner for TransitOps. Given a trip request and lists of ' +
          'already-vetted candidate vehicles and drivers (all are confirmed eligible and have ' +
          'sufficient capacity), recommend up to 3 vehicle+driver pairings ranked best first. ' +
          'Only use ids that appear in the candidate lists — never invent an id. Prefer higher ' +
          'driver safety scores and a closer match between cargo weight and vehicle capacity ' +
          '(less wasted capacity, without being too tight). Give a one-sentence rationale per pairing.',
        userContent: JSON.stringify({
          trip: {
            source: dto.source,
            destination: dto.destination,
            cargoWeightKg: dto.cargoWeightKg,
            plannedDistanceKm: dto.plannedDistanceKm,
          },
          candidateVehicles: candidateVehicles.map((v) => ({
            id: v.id,
            name: v.name,
            registrationNumber: v.registrationNumber,
            type: v.type,
            region: v.region,
            maxLoadCapacityKg: Number(v.maxLoadCapacityKg),
          })),
          candidateDrivers: eligibleDrivers.map((d) => ({
            id: d.id,
            name: d.name,
            licenseCategory: d.licenseCategory,
            safetyScore: d.safetyScore,
          })),
        }),
        schema: RECOMMENDATION_SCHEMA,
        effort: 'medium',
        maxTokens: 1024,
      });

    // Defense in depth: never trust model-returned ids blindly — drop
    // anything that doesn't reference a real candidate from this request.
    // The "up to 3" cap can no longer live in the schema (see comment above
    // RECOMMENDATION_SCHEMA), so it's enforced here too.
    const vehicleIds = new Set(candidateVehicles.map((v) => v.id));
    const driverIds = new Set(eligibleDrivers.map((d) => d.id));
    const recommendations = raw.recommendations
      .filter((r) => vehicleIds.has(r.vehicleId) && driverIds.has(r.driverId))
      .slice(0, 3);

    return { recommendations };
  }
}
