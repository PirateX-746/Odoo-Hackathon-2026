"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { TripForm } from "../_components/TripForm";
import { createTrip } from "@/services/tripService";
import type { TripInput } from "@/types/trip";

export default function NewTripPage() {
  const router = useRouter();

  const handleSubmit = async (values: TripInput) => {
    const trip = await createTrip(values);
    toast.success("Trip created");
    router.push(`/trips/${trip.id}`);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New trip</h1>
        <p className="text-sm text-muted-foreground">Schedule a new dispatch trip.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <TripForm submitLabel="Create trip" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
