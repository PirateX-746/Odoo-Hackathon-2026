"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    listDispatchEligibleVehicles().then(setVehicles);
    listDispatchEligibleDrivers().then(setDrivers);
  }, []);

  const {
    register,
    handleSubmit,
    control,
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

  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Only vehicles and drivers currently available for dispatch are listed. The trip is
        created as a draft — dispatch it from the trip list once ready.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="source">Source</Label>
          <Input id="source" placeholder="Pune" {...register("source")} />
          {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" placeholder="Mumbai" {...register("destination")} />
          {errors.destination && (
            <p className="text-xs text-destructive">{errors.destination.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Vehicle</Label>
          <Controller
            control={control}
            name="vehicleId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
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
          {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Driver</Label>
          <Controller
            control={control}
            name="driverId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
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
          {errors.driverId && <p className="text-xs text-destructive">{errors.driverId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cargoWeightKg">Cargo weight (kg)</Label>
          <Input
            id="cargoWeightKg"
            type="number"
            step="0.01"
            {...register("cargoWeightKg", { valueAsNumber: true })}
          />
          {errors.cargoWeightKg && (
            <p className="text-xs text-destructive">{errors.cargoWeightKg.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plannedDistanceKm">Planned distance (km)</Label>
          <Input
            id="plannedDistanceKm"
            type="number"
            step="0.01"
            {...register("plannedDistanceKm", { valueAsNumber: true })}
          />
          {errors.plannedDistanceKm && (
            <p className="text-xs text-destructive">{errors.plannedDistanceKm.message}</p>
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
