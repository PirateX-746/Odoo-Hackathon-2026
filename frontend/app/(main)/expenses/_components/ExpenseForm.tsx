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
import { EXPENSE_TYPE } from "@/libs/constant";
import type { Expense, ExpenseInput, ExpenseType } from "@/types/expense";
import type { Vehicle } from "@/types/vehicle";
import { listAllVehicles } from "@/services/vehicleService";

const TYPE_OPTIONS = Object.values(EXPENSE_TYPE);
const TYPE_LABELS: Record<string, string> = {
  TOLL: "Toll",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  type: z.enum(TYPE_OPTIONS as [string, ...string[]]),
  amount: z.number().min(0, "Must be 0 or more"),
  date: z.string().min(1, "Required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  defaultValues?: Expense;
  submitLabel: string;
  onSubmit: (values: ExpenseInput) => Promise<void>;
}

export function ExpenseForm({ defaultValues, submitLabel, onSubmit }: ExpenseFormProps) {
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
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vehicleId: defaultValues?.vehicleId ?? "",
      type: defaultValues?.type ?? EXPENSE_TYPE.OTHER,
      amount: defaultValues?.amount ?? 0,
      date: defaultValues?.date?.slice(0, 10) ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      type: values.type as ExpenseType,
      description: values.description || undefined,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
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
                      {v.registrationNumber} — {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(value: string) => TYPE_LABELS[value] ?? value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" placeholder="Toll charge on NH48" {...register("description")} />
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
