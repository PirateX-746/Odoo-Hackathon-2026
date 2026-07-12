"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { MaintenanceForm } from "../_components/MaintenanceForm";
import { createMaintenanceLog } from "@/services/maintenanceService";
import type { CreateMaintenanceInput } from "@/types/maintenance";
import { extractErrorMessage } from "@/libs/helper";

export default function NewMaintenancePage() {
  const router = useRouter();

  const handleSubmit = async (values: CreateMaintenanceInput) => {
    try {
      const log = await createMaintenanceLog(values);
      toast.success("Maintenance log opened");
      router.push(`/maintenance/${log.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New maintenance log</h1>
        <p className="text-sm text-muted-foreground">
          Opening a log moves the vehicle to In Shop until it&apos;s closed.
        </p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <MaintenanceForm submitLabel="Open log" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
