"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleForm } from "../_components/VehicleForm";
import { createVehicle } from "@/services/vehicleService";
import type { VehicleInput } from "@/types/vehicle";

export default function NewVehiclePage() {
  const router = useRouter();

  const handleSubmit = async (values: VehicleInput) => {
    try {
      const vehicle = await createVehicle(values);
      toast.success("Vehicle created");
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create vehicle");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New vehicle</h1>
        <p className="text-sm text-muted-foreground">Add a vehicle to the fleet.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <VehicleForm submitLabel="Create vehicle" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
