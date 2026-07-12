"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CompleteTripInput } from "@/types/trip";

const completeSchema = z.object({
  endOdometerKm: z.number(),
  fuelConsumedLiters: z.number().min(0, "Must be 0 or more"),
  revenue: z.number().min(0, "Must be 0 or more").optional(),
});

type FormValues = z.infer<typeof completeSchema>;

interface CompleteTripDialogProps {
  trigger: React.ReactElement;
  startOdometerKm: number;
  onSubmit: (values: CompleteTripInput) => Promise<void>;
}

export function CompleteTripDialog({
  trigger,
  startOdometerKm,
  onSubmit,
}: CompleteTripDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(
      completeSchema.refine((v) => v.endOdometerKm > startOdometerKm, {
        message: `Must be greater than start odometer (${startOdometerKm} km)`,
        path: ["endOdometerKm"],
      }),
    ),
    defaultValues: { endOdometerKm: startOdometerKm, fuelConsumedLiters: 0 },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    reset();
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete trip</DialogTitle>
          <DialogDescription>
            Record the closing odometer reading and fuel consumed to close out this trip.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="endOdometerKm">End odometer (km)</Label>
            <Input
              id="endOdometerKm"
              type="number"
              step="0.01"
              {...register("endOdometerKm", { valueAsNumber: true })}
            />
            {errors.endOdometerKm && (
              <p className="text-xs text-destructive">{errors.endOdometerKm.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fuelConsumedLiters">Fuel consumed (liters)</Label>
            <Input
              id="fuelConsumedLiters"
              type="number"
              step="0.01"
              {...register("fuelConsumedLiters", { valueAsNumber: true })}
            />
            {errors.fuelConsumedLiters && (
              <p className="text-xs text-destructive">{errors.fuelConsumedLiters.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="revenue">Revenue (optional)</Label>
            <Controller
              control={control}
              name="revenue"
              render={({ field }) => (
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              )}
            />
            {errors.revenue && <p className="text-xs text-destructive">{errors.revenue.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Completing…" : "Complete trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
