"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { closeMaintenanceLog, getMaintenanceLog } from "@/services/maintenanceService";
import { getVehicle } from "@/services/vehicleService";
import type { MaintenanceLog } from "@/types/maintenance";
import type { Vehicle } from "@/types/vehicle";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import { CAN_MANAGE_MAINTENANCE, MAINTENANCE_STATUS } from "@/libs/constant";

export function MaintenanceDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const [log, setLog] = useState<MaintenanceLog | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let active = true;
    getMaintenanceLog(id).then(async (l) => {
      if (!active) return;
      if (!l) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }
      setLog(l);
      const v = await getVehicle(l.vehicleId);
      if (active) setVehicle(v);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  if (loading || !log) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const canManage = Boolean(user && CAN_MANAGE_MAINTENANCE.includes(user.role));

  const handleClose = async () => {
    setClosing(true);
    try {
      setLog(await closeMaintenanceLog(log.id));
      toast.success("Maintenance log closed");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/maintenance" />} nativeButton={false}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{log.type}</h1>
            <p className="text-sm text-muted-foreground">Opened {formatDate(log.openedAt)}</p>
          </div>
        </div>
        {canManage && log.status === MAINTENANCE_STATUS.ACTIVE && (
          <Button onClick={handleClose} disabled={closing}>
            <CheckCircle2 className="size-4" />
            {closing ? "Closing…" : "Close log"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Status</p>
            <div className="mt-1.5">
              <StatusBadge status={log.status} />
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
            <p className="text-xs text-muted-foreground uppercase">Cost</p>
            <p className="mt-1 font-mono text-lg tabular-nums">₹{log.cost.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Opened</p>
            <p className="mt-1 text-sm">{formatDate(log.openedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Closed</p>
            <p className="mt-1 text-sm">{log.closedAt ? formatDate(log.closedAt) : "—"}</p>
          </div>
          {log.description && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-muted-foreground uppercase">Description</p>
              <p className="mt-1 text-sm text-foreground">{log.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
