"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Wrench, AlertTriangle, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { GaugeTile } from "@/app/_components/ui/GaugeTile";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getFleetSummary,
  getExpiryAlerts,
  type ExpiryAlert,
  type FleetSummary,
} from "@/services/fleetService";
import { listAllVehicles } from "@/services/vehicleService";
import { listAllDrivers } from "@/services/driverService";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";
import { useAuth } from "@/libs/auth";
import { getDisplayNameFromEmail } from "@/libs/helper";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getFleetSummary(),
      getExpiryAlerts(),
      listAllVehicles(),
      listAllDrivers(),
    ]).then(([s, a, v, d]) => {
      if (!active) return;
      setSummary(s);
      setAlerts(a);
      setVehicles(v);
      setDrivers(d);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const driverName = (id: string | null) =>
    drivers.find((d) => d.id === id)?.name ?? "Unassigned";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back{user ? `, ${getDisplayNameFromEmail(user.email).split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s the state of your fleet right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading || !summary
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))
          : [
              <GaugeTile key="active" label="Active Vehicles" value={String(summary.activeVehicles)} icon={Truck} index={0} />,
              <GaugeTile
                key="inshop"
                label="In Shop"
                value={String(summary.inShopVehicles)}
                icon={Wrench}
                index={1}
                tone={summary.inShopVehicles > 0 ? "warn" : "default"}
              />,
              <GaugeTile
                key="expiring"
                label="Expiring Docs"
                value={String(summary.expiringDocs)}
                icon={AlertTriangle}
                index={2}
                tone={summary.expiringDocs > 0 ? "critical" : "default"}
              />,
              <GaugeTile key="trips" label="Active Trips" value={String(summary.activeTrips)} icon={Route} index={3} />,
            ]}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Fleet status board</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="space-y-2 px-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="pr-4 text-right">Odometer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.slice(0, 8).map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="pl-4">
                        <Link
                          href={`/vehicles/${v.id}`}
                          className="font-mono text-sm hover:text-primary hover:underline"
                        >
                          {v.registrationNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={v.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {driverName(v.assignedDriverId)}
                      </TableCell>
                      <TableCell className="pr-4 text-right font-mono text-sm tabular-nums">
                        {v.odometerKm.toLocaleString("en-IN")} km
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiring documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : alerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing expiring in the next 30 days.
              </p>
            ) : (
              alerts.slice(0, 8).map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md border-l-2 bg-muted/40 px-3 py-2 transition-colors hover:bg-muted",
                    alert.severity === "critical" ? "border-l-signal-critical" : "border-l-signal-warn",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{alert.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{alert.subLabel}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      alert.severity === "critical" ? "text-signal-critical" : "text-signal-warn",
                    )}
                  >
                    {alert.daysRemaining < 0
                      ? `${Math.abs(alert.daysRemaining)}d overdue`
                      : `${alert.daysRemaining}d left`}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
