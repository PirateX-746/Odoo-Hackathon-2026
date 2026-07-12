"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FuelLogForm } from "./FuelLogForm";
import { getFuelLog, updateFuelLog } from "@/services/fuelLogService";
import type { FuelLog, FuelLogInput } from "@/types/fuelLog";
import { extractErrorMessage } from "@/libs/helper";

export function FuelLogEditView({ id }: { id: string }) {
  const router = useRouter();
  const [fuelLog, setFuelLog] = useState<FuelLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let active = true;
    getFuelLog(id).then((f) => {
      if (!active) return;
      if (!f) {
        setNotFoundState(true);
      } else {
        setFuelLog(f);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  const handleSubmit = async (values: FuelLogInput) => {
    try {
      await updateFuelLog(id, values);
      toast.success("Fuel log updated");
      router.push("/fuel");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit fuel log</h1>
        <p className="text-sm text-muted-foreground">Update this fuel purchase record.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          {loading || !fuelLog ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <FuelLogForm defaultValues={fuelLog} submitLabel="Save changes" onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
