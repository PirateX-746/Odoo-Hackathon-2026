"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { FuelLog, FuelLogInput } from "@/types/fuelLog";
import type { Vehicle } from "@/types/vehicle";
import type { Trip } from "@/types/trip";
import { listAllVehicles } from "@/services/vehicleService";
import { listAllTrips } from "@/services/tripService";
import { extractErrorMessage } from "@/libs/helper";

const NO_TRIP = "__none__";

const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  tripId: z.string(),
  liters: z.number().min(0.01, "Must be greater than 0"),
  cost: z.number().min(0, "Must be 0 or more"),
  date: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof fuelLogSchema>;

interface FuelLogFormProps {
  defaultValues?: FuelLog;
  submitLabel: string;
  onSubmit: (values: FuelLogInput) => Promise<void>;
}

export function FuelLogForm({ defaultValues, submitLabel, onSubmit }: FuelLogFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    listAllVehicles()
      .then(setVehicles)
      .catch((err) => toast.error(extractErrorMessage(err)));
    listAllTrips()
      .then(setTrips)
      .catch((err) => toast.error(extractErrorMessage(err)));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicleId: defaultValues?.vehicleId ?? "",
      tripId: defaultValues?.tripId ?? NO_TRIP,
      liters: defaultValues?.liters ?? 0,
      cost: defaultValues?.cost ?? 0,
      date: defaultValues?.date?.slice(0, 10) ?? "",
    },
  });

  const selectedVehicleId = watch("vehicleId");
  const eligibleTrips = trips.filter((t) => !selectedVehicleId || t.vehicleId === selectedVehicleId);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      tripId: values.tripId === NO_TRIP ? undefined : values.tripId,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
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
                      {v.registrationNumber} — {v.name}
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
          <Label htmlFor="tripId">Trip (optional)</Label>
          <Controller
            control={control}
            name="tripId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="tripId" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === NO_TRIP
                        ? "No trip"
                        : `${eligibleTrips.find((t) => t.id === value)?.source ?? "—"} → ${eligibleTrips.find((t) => t.id === value)?.destination ?? ""}`
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TRIP}>No trip</SelectItem>
                  {eligibleTrips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.source} → {t.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="liters">Liters</Label>
          <Input
            id="liters"
            type="number"
            step="0.01"
            aria-invalid={!!errors.liters}
            aria-describedby={errors.liters ? "liters-error" : undefined}
            {...register("liters", { valueAsNumber: true })}
          />
          {errors.liters && (
            <p id="liters-error" className="text-xs text-destructive">
              {errors.liters.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            aria-invalid={!!errors.cost}
            aria-describedby={errors.cost ? "cost-error" : undefined}
            {...register("cost", { valueAsNumber: true })}
          />
          {errors.cost && (
            <p id="cost-error" className="text-xs text-destructive">
              {errors.cost.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-error" : undefined}
            {...register("date")}
          />
          {errors.date && (
            <p id="date-error" className="text-xs text-destructive">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || vehicles.length === 0}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
