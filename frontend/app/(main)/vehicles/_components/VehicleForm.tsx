"use client";

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
import { VEHICLE_STATUS } from "@/libs/constant";
import type { VehicleInput, VehicleStatus } from "@/types/vehicle";

const STATUS_OPTIONS = Object.values(VEHICLE_STATUS);

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

const vehicleSchema = z.object({
  registrationNumber: z.string().min(3, "Enter a valid registration number"),
  name: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  region: z.string().min(1, "Required"),
  maxLoadCapacityKg: z.number().min(0, "Must be 0 or more"),
  acquisitionCost: z.number().min(0, "Must be 0 or more"),
  odometerKm: z.number().min(0, "Must be 0 or more"),
  status: z.enum(STATUS_OPTIONS as [string, ...string[]]),
});

type FormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  defaultValues?: VehicleInput;
  submitLabel: string;
  onSubmit: (values: VehicleInput) => Promise<void>;
}

export function VehicleForm({ defaultValues, submitLabel, onSubmit }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: defaultValues?.registrationNumber ?? "",
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "",
      region: defaultValues?.region ?? "",
      maxLoadCapacityKg: defaultValues?.maxLoadCapacityKg ?? 0,
      acquisitionCost: defaultValues?.acquisitionCost ?? 0,
      odometerKm: defaultValues?.odometerKm ?? 0,
      status: defaultValues?.status ?? VEHICLE_STATUS.AVAILABLE,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({ ...values, status: values.status as VehicleStatus });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="registrationNumber">Registration number</Label>
          <Input
            id="registrationNumber"
            placeholder="MH12AB1234"
            aria-invalid={!!errors.registrationNumber}
            aria-describedby={errors.registrationNumber ? "registrationNumber-error" : undefined}
            {...register("registrationNumber")}
          />
          {errors.registrationNumber && (
            <p id="registrationNumber-error" className="text-xs text-destructive">
              {errors.registrationNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Van-05"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            placeholder="Van, Truck, Bus…"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? "type-error" : undefined}
            {...register("type")}
          />
          {errors.type && (
            <p id="type-error" className="text-xs text-destructive">
              {errors.type.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            placeholder="North, South, East, West…"
            aria-invalid={!!errors.region}
            aria-describedby={errors.region ? "region-error" : undefined}
            {...register("region")}
          />
          {errors.region && (
            <p id="region-error" className="text-xs text-destructive">
              {errors.region.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxLoadCapacityKg">Max load capacity (kg)</Label>
          <Input
            id="maxLoadCapacityKg"
            type="number"
            step="0.01"
            aria-invalid={!!errors.maxLoadCapacityKg}
            aria-describedby={errors.maxLoadCapacityKg ? "maxLoadCapacityKg-error" : undefined}
            {...register("maxLoadCapacityKg", { valueAsNumber: true })}
          />
          {errors.maxLoadCapacityKg && (
            <p id="maxLoadCapacityKg-error" className="text-xs text-destructive">
              {errors.maxLoadCapacityKg.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="acquisitionCost">Acquisition cost</Label>
          <Input
            id="acquisitionCost"
            type="number"
            step="0.01"
            aria-invalid={!!errors.acquisitionCost}
            aria-describedby={errors.acquisitionCost ? "acquisitionCost-error" : undefined}
            {...register("acquisitionCost", { valueAsNumber: true })}
          />
          {errors.acquisitionCost && (
            <p id="acquisitionCost-error" className="text-xs text-destructive">
              {errors.acquisitionCost.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="odometerKm">Odometer (km)</Label>
          <Input
            id="odometerKm"
            type="number"
            step="0.01"
            aria-invalid={!!errors.odometerKm}
            aria-describedby={errors.odometerKm ? "odometerKm-error" : undefined}
            {...register("odometerKm", { valueAsNumber: true })}
          />
          {errors.odometerKm && (
            <p id="odometerKm-error" className="text-xs text-destructive">
              {errors.odometerKm.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue>{(value: string) => STATUS_LABELS[value] ?? value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
