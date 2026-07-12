"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateTripInput } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";
import { listDispatchEligibleVehicles } from "@/services/vehicleService";
import { listDispatchEligibleDrivers } from "@/services/driverService";
import {
  getDispatchRecommendations,
  type DispatchRecommendation,
} from "@/services/dispatchService";
import { useAuth } from "@/libs/auth";
import { CAN_MANAGE_TRIPS } from "@/libs/constant";

const tripSchema = z.object({
  source: z.string().min(1, "Required"),
  destination: z.string().min(1, "Required"),
  vehicleId: z.string().min(1, "Select a vehicle"),
  driverId: z.string().min(1, "Select a driver"),
  cargoWeightKg: z.number().min(0.01, "Must be greater than 0"),
  plannedDistanceKm: z.number().min(0.01, "Must be greater than 0"),
});

type FormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  submitLabel: string;
  onSubmit: (values: CreateTripInput) => Promise<void>;
}

export function TripForm({ submitLabel, onSubmit }: TripFormProps) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<DispatchRecommendation | null>(null);

  const canUseDispatchAssistant = Boolean(user && CAN_MANAGE_TRIPS.includes(user.role));

  useEffect(() => {
    listDispatchEligibleVehicles().then(setVehicles);
    listDispatchEligibleDrivers().then(setDrivers);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      source: "",
      destination: "",
      vehicleId: "",
      driverId: "",
      cargoWeightKg: 0,
      plannedDistanceKm: 0,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const handleSuggest = async () => {
    const values = getValues();
    if (!values.source || !values.destination || !values.cargoWeightKg || !values.plannedDistanceKm) {
      toast.error("Fill in source, destination, cargo weight, and distance first.");
      return;
    }
    setSuggesting(true);
    setSuggestion(null);
    const { recommendations, error } = await getDispatchRecommendations({
      source: values.source,
      destination: values.destination,
      cargoWeightKg: values.cargoWeightKg,
      plannedDistanceKm: values.plannedDistanceKm,
    });
    setSuggesting(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (recommendations.length === 0) {
      toast.info("No suitable vehicle/driver combination found.");
      return;
    }
    setSuggestion(recommendations[0]);
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setValue("vehicleId", suggestion.vehicleId, { shouldValidate: true });
    setValue("driverId", suggestion.driverId, { shouldValidate: true });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Only vehicles and drivers currently available for dispatch are listed. The trip is
        created as a draft — dispatch it from the trip list once ready.
      </p>

      {canUseDispatchAssistant && (
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Sparkles className="size-4 text-primary" />
              Smart Dispatch Assistant
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleSuggest} disabled={suggesting}>
              {suggesting ? "Thinking…" : "Suggest vehicle & driver"}
            </Button>
          </div>
          {suggestion && (
            <div className="mt-2 flex items-start justify-between gap-3 rounded-md bg-background p-2 text-sm">
              <div className="min-w-0">
                <p className="text-foreground">
                  {vehicles.find((v) => v.id === suggestion.vehicleId)?.registrationNumber ??
                    suggestion.vehicleId}
                  {" · "}
                  {drivers.find((d) => d.id === suggestion.driverId)?.name ?? suggestion.driverId}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{suggestion.rationale}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round(suggestion.confidenceScore * 100)}% match
                </span>
                <Button type="button" size="sm" onClick={applySuggestion}>
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="Pune"
            aria-invalid={!!errors.source}
            aria-describedby={errors.source ? "source-error" : undefined}
            {...register("source")}
          />
          {errors.source && (
            <p id="source-error" className="text-xs text-destructive">
              {errors.source.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            placeholder="Mumbai"
            aria-invalid={!!errors.destination}
            aria-describedby={errors.destination ? "destination-error" : undefined}
            {...register("destination")}
          />
          {errors.destination && (
            <p id="destination-error" className="text-xs text-destructive">
              {errors.destination.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vehicleId">Vehicle</Label>
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="vehicleId"
                  className="w-full"
                  aria-invalid={!!errors.vehicleId}
                  aria-describedby={errors.vehicleId ? "vehicleId-error" : undefined}
                >
                  <SelectValue>
                    {(value: string) =>
                      vehicles.find((v) => v.id === value)?.registrationNumber ??
                      (vehicles.length === 0 ? "No vehicles available" : "Select vehicle")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.name} ({v.maxLoadCapacityKg} kg max)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.vehicleId && (
            <p id="vehicleId-error" className="text-xs text-destructive">
              {errors.vehicleId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="driverId">Driver</Label>
          <Controller
            control={control}
            name="driverId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="driverId"
                  className="w-full"
                  aria-invalid={!!errors.driverId}
                  aria-describedby={errors.driverId ? "driverId-error" : undefined}
                >
                  <SelectValue>
                    {(value: string) =>
                      drivers.find((d) => d.id === value)?.name ??
                      (drivers.length === 0 ? "No drivers available" : "Select driver")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.driverId && (
            <p id="driverId-error" className="text-xs text-destructive">
              {errors.driverId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cargoWeightKg">Cargo weight (kg)</Label>
          <Input
            id="cargoWeightKg"
            type="number"
            step="0.01"
            aria-invalid={!!errors.cargoWeightKg}
            aria-describedby={errors.cargoWeightKg ? "cargoWeightKg-error" : undefined}
            {...register("cargoWeightKg", { valueAsNumber: true })}
          />
          {errors.cargoWeightKg && (
            <p id="cargoWeightKg-error" className="text-xs text-destructive">
              {errors.cargoWeightKg.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plannedDistanceKm">Planned distance (km)</Label>
          <Input
            id="plannedDistanceKm"
            type="number"
            step="0.01"
            aria-invalid={!!errors.plannedDistanceKm}
            aria-describedby={errors.plannedDistanceKm ? "plannedDistanceKm-error" : undefined}
            {...register("plannedDistanceKm", { valueAsNumber: true })}
          />
          {errors.plannedDistanceKm && (
            <p id="plannedDistanceKm-error" className="text-xs text-destructive">
              {errors.plannedDistanceKm.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || vehicles.length === 0 || drivers.length === 0}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
