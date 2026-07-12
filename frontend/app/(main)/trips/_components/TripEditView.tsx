"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TripForm } from "./TripForm";
import { getTrip, updateTrip } from "@/services/tripService";
import type { Trip, TripInput } from "@/types/trip";

export function TripEditView({ id }: { id: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let active = true;
    getTrip(id).then((t) => {
      if (!active) return;
      if (!t) {
        setNotFoundState(true);
      } else {
        setTrip(t);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  const handleSubmit = async (values: TripInput) => {
    await updateTrip(id, values);
    toast.success("Trip updated");
    router.push(`/trips/${id}`);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit trip</h1>
        <p className="text-sm text-muted-foreground">Update this trip&apos;s schedule and details.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          {loading || !trip ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <TripForm defaultValues={trip} submitLabel="Save changes" onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
