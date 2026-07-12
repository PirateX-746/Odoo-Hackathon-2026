"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateMaintenanceInput } from "@/types/maintenance";
import type { Vehicle } from "@/types/vehicle";
import { listAllVehicles } from "@/services/vehicleService";

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  type: z.string().min(1, "Required"),
  description: z.string().optional(),
  cost: z.number().min(0, "Must be 0 or more"),
});

type FormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  submitLabel: string;
  onSubmit: (values: CreateMaintenanceInput) => Promise<void>;
}

export function MaintenanceForm({ submitLabel, onSubmit }: MaintenanceFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    listAllVehicles().then(setVehicles);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { vehicleId: "", type: "", description: "", cost: 0 },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({ ...values, description: values.description || undefined });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
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
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            placeholder="Oil change, Brake service…"
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

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" placeholder="Routine oil and filter change" {...register("description")} />
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
