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
          <Input id="registrationNumber" placeholder="MH12AB1234" {...register("registrationNumber")} />
          {errors.registrationNumber && (
            <p className="text-xs text-destructive">{errors.registrationNumber.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Van-05" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Input id="type" placeholder="Van, Truck, Bus…" {...register("type")} />
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="region">Region</Label>
          <Input id="region" placeholder="North, South, East, West…" {...register("region")} />
          {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxLoadCapacityKg">Max load capacity (kg)</Label>
          <Input
            id="maxLoadCapacityKg"
            type="number"
            step="0.01"
            {...register("maxLoadCapacityKg", { valueAsNumber: true })}
          />
          {errors.maxLoadCapacityKg && (
            <p className="text-xs text-destructive">{errors.maxLoadCapacityKg.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="acquisitionCost">Acquisition cost</Label>
          <Input
            id="acquisitionCost"
            type="number"
            step="0.01"
            {...register("acquisitionCost", { valueAsNumber: true })}
          />
          {errors.acquisitionCost && (
            <p className="text-xs text-destructive">{errors.acquisitionCost.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="odometerKm">Odometer (km)</Label>
          <Input
            id="odometerKm"
            type="number"
            step="0.01"
            {...register("odometerKm", { valueAsNumber: true })}
          />
          {errors.odometerKm && (
            <p className="text-xs text-destructive">{errors.odometerKm.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
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
