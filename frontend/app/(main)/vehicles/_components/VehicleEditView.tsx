"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleForm } from "./VehicleForm";
import { getVehicle, updateVehicle } from "@/services/vehicleService";
import type { Vehicle, VehicleInput } from "@/types/vehicle";

export function VehicleEditView({ id }: { id: string }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let active = true;
    getVehicle(id).then((v) => {
      if (!active) return;
      if (!v) {
        setNotFoundState(true);
      } else {
        setVehicle(v);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  const handleSubmit = async (values: VehicleInput) => {
    try {
      await updateVehicle(id, values);
      toast.success("Vehicle updated");
      router.push(`/vehicles/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update vehicle");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit vehicle</h1>
        <p className="text-sm text-muted-foreground">Update details for this vehicle.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          {loading || !vehicle ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <VehicleForm defaultValues={vehicle} submitLabel="Save changes" onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
