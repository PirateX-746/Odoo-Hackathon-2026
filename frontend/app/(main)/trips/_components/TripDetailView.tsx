"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { CompleteTripDialog } from "./CompleteTripDialog";
import { cancelTrip, dispatchTrip, completeTrip, getTrip } from "@/services/tripService";
import { getVehicle } from "@/services/vehicleService";
import { getDriver } from "@/services/driverService";
import type { CompleteTripInput, Trip } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import { CAN_COMPLETE_TRIPS, CAN_MANAGE_TRIPS, TRIP_STATUS } from "@/libs/constant";

export function TripDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [actionPending, setActionPending] = useState(false);

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

  const canManage = Boolean(user && CAN_MANAGE_TRIPS.includes(user.role));
  const canComplete = Boolean(user && CAN_COMPLETE_TRIPS.includes(user.role));

  const handleDispatch = async () => {
    setActionPending(true);
    try {
      setTrip(await dispatchTrip(trip.id));
      toast.success("Trip dispatched");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionPending(false);
    }
  };

  const handleCancel = async () => {
    setActionPending(true);
    try {
      setTrip(await cancelTrip(trip.id));
      toast.success("Trip cancelled");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionPending(false);
    }
  };

  const handleComplete = async (values: CompleteTripInput) => {
    try {
      setTrip(await completeTrip(trip.id, values));
      toast.success("Trip completed");
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/trips" />} nativeButton={false}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {trip.source} <span className="text-muted-foreground">→</span> {trip.destination}
            </h1>
            <p className="text-sm text-muted-foreground">Created {formatDate(trip.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {trip.status === TRIP_STATUS.DRAFT && canManage && (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={actionPending}>
                <Ban className="size-4" />
                Cancel
              </Button>
              <Button onClick={handleDispatch} disabled={actionPending}>
                <Send className="size-4" />
                Dispatch
              </Button>
            </>
          )}
          {trip.status === TRIP_STATUS.DISPATCHED && (
            <>
              {canManage && (
                <Button variant="outline" onClick={handleCancel} disabled={actionPending}>
                  <Ban className="size-4" />
                  Cancel
                </Button>
              )}
              {canComplete && trip.startOdometerKm !== null && (
                <CompleteTripDialog
                  startOdometerKm={trip.startOdometerKm}
                  onSubmit={handleComplete}
                  trigger={
                    <Button>
                      <CheckCircle2 className="size-4" />
                      Complete
                    </Button>
                  }
                />
              )}
            </>
          )}
        </div>
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
            <p className="text-xs text-muted-foreground uppercase">Cargo weight</p>
            <p className="mt-1 font-mono text-sm">{trip.cargoWeightKg} kg</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Planned distance</p>
            <p className="mt-1 font-mono text-sm">{trip.plannedDistanceKm} km</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Actual distance</p>
            <p className="mt-1 font-mono text-sm">
              {trip.actualDistanceKm != null ? `${trip.actualDistanceKm} km` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Start odometer</p>
            <p className="mt-1 font-mono text-sm">
              {trip.startOdometerKm != null ? `${trip.startOdometerKm} km` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">End odometer</p>
            <p className="mt-1 font-mono text-sm">
              {trip.endOdometerKm != null ? `${trip.endOdometerKm} km` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Fuel consumed</p>
            <p className="mt-1 font-mono text-sm">
              {trip.fuelConsumedLiters != null ? `${trip.fuelConsumedLiters} L` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Revenue</p>
            <p className="mt-1 font-mono text-sm">
              {trip.revenue != null ? `₹${trip.revenue.toLocaleString("en-IN")}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Dispatched</p>
            <p className="mt-1 text-sm">{trip.dispatchedAt ? formatDate(trip.dispatchedAt) : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">
              {trip.status === TRIP_STATUS.CANCELLED ? "Cancelled" : "Completed"}
            </p>
            <p className="mt-1 text-sm">
              {(() => {
                const stamp = trip.status === TRIP_STATUS.CANCELLED ? trip.cancelledAt : trip.completedAt;
                return stamp ? formatDate(stamp) : "—";
              })()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
