"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DriverForm } from "./DriverForm";
import { getDriver, updateDriver } from "@/services/driverService";
import type { Driver, DriverInput } from "@/types/driver";

export function DriverEditView({ id }: { id: string }) {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let active = true;
    getDriver(id).then((d) => {
      if (!active) return;
      if (!d) {
        setNotFoundState(true);
      } else {
        setDriver(d);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  const handleSubmit = async (values: DriverInput) => {
    try {
      await updateDriver(id, values);
      toast.success("Driver updated");
      router.push(`/drivers/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update driver");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit driver</h1>
        <p className="text-sm text-muted-foreground">Update this driver&apos;s details.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          {loading || !driver ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <DriverForm defaultValues={driver} submitLabel="Save changes" onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
