"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { getVehicle } from "@/services/vehicleService";
import { useAuth } from "@/libs/auth";
import { CAN_MANAGE_VEHICLES } from "@/libs/constant";
import type { Vehicle } from "@/types/vehicle";

export function VehicleDetailView({ id }: { id: string }) {
  const { user } = useAuth();
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

  if (loading || !vehicle) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const canManage = Boolean(user && CAN_MANAGE_VEHICLES.includes(user.role));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/vehicles" />} nativeButton={false}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-mono text-xl font-semibold text-foreground">
              {vehicle.registrationNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              {vehicle.name} · {vehicle.type} · {vehicle.region}
            </p>
          </div>
        </div>
        {canManage && (
          <Button render={<Link href={`/vehicles/${vehicle.id}/edit`} />} nativeButton={false}>
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Status</p>
            <div className="mt-1.5">
              <StatusBadge status={vehicle.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Odometer</p>
            <p className="mt-1 font-mono text-lg tabular-nums">
              {vehicle.odometerKm.toLocaleString("en-IN")} km
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Max load capacity</p>
            <p className="mt-1 font-mono text-lg tabular-nums">
              {vehicle.maxLoadCapacityKg.toLocaleString("en-IN")} kg
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Acquisition cost</p>
            <p className="mt-1 font-mono text-sm">
              ₹{vehicle.acquisitionCost.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Region</p>
            <p className="mt-1 text-sm">{vehicle.region}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Type</p>
            <p className="mt-1 text-sm">{vehicle.type}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
