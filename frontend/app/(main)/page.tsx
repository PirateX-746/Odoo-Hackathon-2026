"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  Truck,
  Wrench,
  AlertTriangle,
  Route,
  Sparkles,
  CircleCheck,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GaugeTile } from "@/app/_components/ui/GaugeTile";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { AiBadge } from "@/app/_components/ui/AiBadge";
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
import { getExpiryAlerts, type ExpiryAlert } from "@/services/fleetService";
import { getDashboardKpis, type DashboardKpis } from "@/services/dashboardService";
import { getInsightsSummary, type InsightsSummary } from "@/services/insightsService";
import { listAllVehicles } from "@/services/vehicleService";
import { listAllDrivers } from "@/services/driverService";
import { listAllTrips } from "@/services/tripService";
import { CAN_VIEW_FLEET_ANALYTICS, TRIP_STATUS } from "@/libs/constant";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";
import { useAuth } from "@/libs/auth";
import { getDisplayNameFromEmail } from "@/libs/helper";

export default function DashboardPage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverByVehicleId, setDriverByVehicleId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const canViewFleetAnalytics = Boolean(user && CAN_VIEW_FLEET_ANALYTICS.includes(user.role));

  useEffect(() => {
    let active = true;
    Promise.all([
      // Only ADMIN/FLEET_MANAGER/SAFETY_OFFICER/FINANCIAL_ANALYST are allowed
      // to call this — a DRIVER would 403, so skip the request entirely
      // rather than leaving the KPI tiles stuck on their loading skeleton.
      canViewFleetAnalytics ? getDashboardKpis() : Promise.resolve(null),
      getExpiryAlerts(),
      listAllVehicles(),
      listAllDrivers(),
      listAllTrips({ status: TRIP_STATUS.DISPATCHED }),
    ])
      .then(([k, a, v, d, trips]) => {
        if (!active) return;
        setKpis(k);
        setAlerts(a);
        setVehicles(v);
        setDrivers(d);
        setDriverByVehicleId(Object.fromEntries(trips.map((t) => [t.vehicleId, t.driverId])));
      })
      .catch((err) => {
        if (!active) return;
        toast.error(err instanceof Error ? err.message : "Failed to load dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canViewFleetAnalytics]);

  useEffect(() => {
    if (!canViewFleetAnalytics) return;
    let active = true;
    getInsightsSummary()
      .then((summary) => {
        if (!active) return;
        setInsights(summary);
      })
      .catch((err) => {
        if (!active) return;
        toast.error(err instanceof Error ? err.message : "Failed to load AI insights.");
      })
      .finally(() => {
        if (active) setInsightsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canViewFleetAnalytics]);

  const driverName = (vehicleId: string) => {
    const driverId = driverByVehicleId[vehicleId];
    return drivers.find((d) => d.id === driverId)?.name ?? "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          Welcome back{user ? `, ${getDisplayNameFromEmail(user.email).split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s the state of your fleet right now.
        </p>
      </div>

      {canViewFleetAnalytics && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {loading || !kpis
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))
            : [
                <GaugeTile
                  key="active"
                  label="Active Vehicles"
                  value={String(kpis.activeVehicles)}
                  icon={Truck}
                  index={0}
                />,
                <GaugeTile
                  key="inshop"
                  label="In Shop"
                  value={String(kpis.vehiclesInMaintenance)}
                  icon={Wrench}
                  index={1}
                  tone={kpis.vehiclesInMaintenance > 0 ? "warn" : "default"}
                />,
                <GaugeTile
                  key="expiring"
                  label="Expiring Licenses"
                  value={String(alerts.length)}
                  icon={AlertTriangle}
                  index={2}
                  tone={alerts.length > 0 ? "critical" : "default"}
                />,
                <GaugeTile
                  key="trips"
                  label="Active Trips"
                  value={String(kpis.activeTrips)}
                  icon={Route}
                  index={3}
                />,
              ]}
        </div>
      )}

      {canViewFleetAnalytics && (
        <Card className="border-primary/20 from-primary/[0.04] bg-gradient-to-br to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md">
                <Sparkles className="size-3.5" />
              </span>
              AI Insights Digest
              <AiBadge />
            </CardTitle>
            {insights && (
              <p className="text-muted-foreground mt-0.5 text-xs">
                Generated {formatDistanceToNowStrict(new Date(insights.generatedAt))} ago
              </p>
            )}
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : insights ? (
              <div className="space-y-4">
                <p className="text-foreground text-sm font-medium">{insights.headline}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <InsightList
                    title="Highlights"
                    items={insights.highlights}
                    icon={CircleCheck}
                    tone="ok"
                  />
                  <InsightList
                    title="Risks"
                    items={insights.risks}
                    icon={AlertTriangle}
                    tone="critical"
                  />
                  <InsightList
                    title="Recommendations"
                    items={insights.recommendations}
                    icon={Lightbulb}
                    tone="default"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Insights unavailable right now.</p>
            )}
          </CardContent>
        </Card>
      )}

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
                          className="hover:text-primary font-mono text-sm hover:underline"
                        >
                          {v.registrationNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={v.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {driverName(v.id)}
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
              <p className="text-muted-foreground py-6 text-center text-sm">
                Nothing expiring in the next 30 days.
              </p>
            ) : (
              alerts.slice(0, 8).map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="bg-muted/40 hover:bg-muted flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      alert.severity === "critical" ? "bg-signal-critical" : "bg-signal-warn",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{alert.label}</p>
                    <p className="text-muted-foreground truncate text-xs">{alert.subLabel}</p>
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

const INSIGHT_TONE_CLASS = {
  ok: "text-signal-ok",
  critical: "text-signal-critical",
  default: "text-primary",
} as const;

function InsightList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone: keyof typeof INSIGHT_TONE_CLASS;
}) {
  return (
    <div className="bg-muted/40 rounded-md p-3">
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold uppercase",
          INSIGHT_TONE_CLASS[tone],
        )}
      >
        <Icon className="size-3.5" />
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-muted-foreground mt-2 text-sm">None</p>
      ) : (
        <ul className="text-foreground mt-2 list-inside list-disc space-y-1.5 text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
