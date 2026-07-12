"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { FuelLogForm } from "../_components/FuelLogForm";
import { createFuelLog } from "@/services/fuelLogService";
import type { FuelLogInput } from "@/types/fuelLog";
import { extractErrorMessage } from "@/libs/helper";

export default function NewFuelLogPage() {
  const router = useRouter();

  const handleSubmit = async (values: FuelLogInput) => {
    try {
      await createFuelLog(values);
      toast.success("Fuel log created");
      router.push("/fuel");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New fuel log</h1>
        <p className="text-sm text-muted-foreground">Record a fuel purchase.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <FuelLogForm submitLabel="Create fuel log" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
