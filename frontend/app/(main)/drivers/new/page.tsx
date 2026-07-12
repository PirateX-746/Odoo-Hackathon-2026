"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { DriverForm } from "../_components/DriverForm";
import { createDriver } from "@/services/driverService";
import type { DriverInput } from "@/types/driver";

export default function NewDriverPage() {
  const router = useRouter();

  const handleSubmit = async (values: DriverInput) => {
    try {
      const driver = await createDriver(values);
      toast.success("Driver created");
      router.push(`/drivers/${driver.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create driver");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New driver</h1>
        <p className="text-sm text-muted-foreground">Add a driver to your roster.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <DriverForm submitLabel="Create driver" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
