"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { getTrip } from "@/services/tripService";
import { getVehicle } from "@/services/vehicleService";
import { getDriver } from "@/services/driverService";
import type { Trip } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";
import { formatDate } from "@/libs/helper";

export function TripDetailView({ id }: { id: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let active = true;
    getTrip(id).then(async (t) => {
      if (!active) return;
      if (!t) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }
      setTrip(t);
      const [v, d] = await Promise.all([getVehicle(t.vehicleId), getDriver(t.driverId)]);
      if (active) {
        setVehicle(v);
        setDriver(d);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  if (loading || !trip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/trips" />} nativeButton={false}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="font-mono text-xl font-semibold text-foreground">{trip.tripCode}</h1>
            <p className="text-sm text-muted-foreground">
              {trip.origin} → {trip.destination}
            </p>
          </div>
        </div>
        <Button render={<Link href={`/trips/${trip.id}/edit`} />} nativeButton={false}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Status</p>
            <div className="mt-1.5">
              <StatusBadge status={trip.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Vehicle</p>
            {vehicle ? (
              <Link
                href={`/vehicles/${vehicle.id}`}
                className="mt-1 block font-mono text-sm font-medium hover:text-primary hover:underline"
              >
                {vehicle.registrationNumber}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Driver</p>
            {driver ? (
              <Link
                href={`/drivers/${driver.id}`}
                className="mt-1 block text-sm font-medium hover:text-primary hover:underline"
              >
                {driver.name}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Scheduled start</p>
            <p className="mt-1 text-sm">
              {formatDate(trip.scheduledStart, "en-IN", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Scheduled end</p>
            <p className="mt-1 text-sm">
              {formatDate(trip.scheduledEnd, "en-IN", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Distance</p>
            <p className="mt-1 font-mono text-sm">
              {trip.distanceKm != null ? `${trip.distanceKm} km` : "—"}
            </p>
          </div>
          {trip.notes && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-muted-foreground uppercase">Notes</p>
              <p className="mt-1 text-sm text-foreground">{trip.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
