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
import { DRIVER_STATUS } from "@/libs/constant";
import type { DriverInput, DriverStatus } from "@/types/driver";

const STATUS_OPTIONS = Object.values(DRIVER_STATUS);

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
};

const driverSchema = z.object({
  name: z.string().min(1, "Required"),
  contactNumber: z.string().min(7, "Enter a valid contact number"),
  licenseNumber: z.string().min(3, "Required"),
  licenseCategory: z.string().min(1, "Required"),
  licenseExpiryDate: z.string().min(1, "Required"),
  safetyScore: z.number().min(0).max(100),
  status: z.enum(STATUS_OPTIONS as [string, ...string[]]),
});

type FormValues = z.infer<typeof driverSchema>;

interface DriverFormProps {
  defaultValues?: DriverInput;
  submitLabel: string;
  onSubmit: (values: DriverInput) => Promise<void>;
}

export function DriverForm({ defaultValues, submitLabel, onSubmit }: DriverFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      contactNumber: defaultValues?.contactNumber ?? "",
      licenseNumber: defaultValues?.licenseNumber ?? "",
      licenseCategory: defaultValues?.licenseCategory ?? "",
      licenseExpiryDate: defaultValues?.licenseExpiryDate?.slice(0, 10) ?? "",
      safetyScore: defaultValues?.safetyScore ?? 100,
      status: defaultValues?.status ?? DRIVER_STATUS.AVAILABLE,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({ ...values, status: values.status as DriverStatus });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Ravi Kumar" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactNumber">Contact number</Label>
          <Input id="contactNumber" placeholder="+91-9876543210" {...register("contactNumber")} />
          {errors.contactNumber && (
            <p className="text-xs text-destructive">{errors.contactNumber.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="licenseNumber">License number</Label>
          <Input id="licenseNumber" placeholder="DL-1420110012345" {...register("licenseNumber")} />
          {errors.licenseNumber && (
            <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="licenseCategory">License category</Label>
          <Input id="licenseCategory" placeholder="LMV, HMV…" {...register("licenseCategory")} />
          {errors.licenseCategory && (
            <p className="text-xs text-destructive">{errors.licenseCategory.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="licenseExpiryDate">License expiry</Label>
          <Input id="licenseExpiryDate" type="date" {...register("licenseExpiryDate")} />
          {errors.licenseExpiryDate && (
            <p className="text-xs text-destructive">{errors.licenseExpiryDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="safetyScore">Safety score (0–100)</Label>
          <Input
            id="safetyScore"
            type="number"
            min={0}
            max={100}
            {...register("safetyScore", { valueAsNumber: true })}
          />
          {errors.safetyScore && (
            <p className="text-xs text-destructive">{errors.safetyScore.message}</p>
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
