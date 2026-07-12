"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Pencil, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { getDriver } from "@/services/driverService";
import { useAuth } from "@/libs/auth";
import { CAN_MANAGE_DRIVERS, EXPIRY_WARNING_WINDOW_DAYS } from "@/libs/constant";
import type { Driver } from "@/types/driver";
import { formatDate } from "@/libs/helper";

export function DriverDetailView({ id }: { id: string }) {
  const { user } = useAuth();
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

  if (loading || !driver) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const daysRemaining = differenceInCalendarDays(new Date(driver.licenseExpiryDate), new Date());
  const flagged = daysRemaining <= EXPIRY_WARNING_WINDOW_DAYS;
  const canManage = Boolean(user && CAN_MANAGE_DRIVERS.includes(user.role));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/drivers" />} nativeButton={false}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{driver.name}</h1>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="size-3.5" />
              {driver.contactNumber}
            </span>
          </div>
        </div>
        {canManage && (
          <Button render={<Link href={`/drivers/${driver.id}/edit`} />} nativeButton={false}>
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
              <StatusBadge status={driver.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">License expiry</p>
            <p className={`mt-1 text-sm font-medium ${flagged ? (daysRemaining < 0 ? "text-signal-critical" : "text-signal-warn") : "text-foreground"}`}>
              {formatDate(driver.licenseExpiryDate)}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase">Safety score</p>
            <p className="mt-1 font-mono text-lg tabular-nums">{driver.safetyScore}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase">License number</p>
            <p className="mt-1 font-mono text-sm">{driver.licenseNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">License category</p>
            <p className="mt-1 text-sm">{driver.licenseCategory}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
