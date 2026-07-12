"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Send, Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { TableSkeletonRows } from "@/app/_components/ui/TableSkeleton";
import { usePaginatedList } from "@/app/_hooks/usePaginatedList";
import { CAN_MANAGE_TRIPS, TRIP_STATUS } from "@/libs/constant";
import { listTrips, dispatchTrip, cancelTrip, type TripListParams } from "@/services/tripService";
import { listAllVehicles } from "@/services/vehicleService";
import { listAllDrivers } from "@/services/driverService";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import type { Trip } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";

const ALL_STATUS = "__all__";
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function TripsPage() {
  const { user } = useAuth();
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<Trip, TripListParams>(listTrips);
  const [searchInput, setSearchInput] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);

  useEffect(() => {
    listAllVehicles()
      .then(setVehicles)
      .catch((err) => toast.error(extractErrorMessage(err)));
    listAllDrivers()
      .then(setDrivers)
      .catch((err) => toast.error(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => updateParams({ search: searchInput || undefined }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const vehiclePlate = useCallback(
    (id: string) => vehicles.find((v) => v.id === id)?.registrationNumber ?? "—",
    [vehicles],
  );
  const driverName = useCallback(
    (id: string) => drivers.find((d) => d.id === id)?.name ?? "—",
    [drivers],
  );

  const canManage = Boolean(user && CAN_MANAGE_TRIPS.includes(user.role));

  const handleDispatch = async (id: string) => {
    setActionPendingId(id);
    try {
      await dispatchTrip(id);
      toast.success("Trip dispatched");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionPendingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionPendingId(id);
    try {
      await cancelTrip(id);
      toast.success("Trip cancelled");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setActionPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Trips</h1>
          <p className="text-muted-foreground text-sm">Dispatch and track fleet trips.</p>
        </div>
        {canManage && (
          <Button render={<Link href="/trips/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Trip
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search source or destination…"
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={params.status ?? ALL_STATUS}
          onValueChange={(v) => updateParams({ status: !v || v === ALL_STATUS ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue>
              {(value: string) => (value === ALL_STATUS ? "All statuses" : STATUS_LABELS[value])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>All statuses</SelectItem>
            {Object.values(TRIP_STATUS).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columns={6} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-12 text-center text-sm">
                  No trips match your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="pl-4 text-sm">
                    {t.source} <span className="text-muted-foreground">→</span> {t.destination}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {vehiclePlate(t.vehicleId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {driverName(t.driverId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/trips/${t.id}`} />}
                        nativeButton={false}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canManage && t.status === TRIP_STATUS.DRAFT && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={actionPendingId === t.id}
                          onClick={() => handleDispatch(t.id)}
                          aria-label="Dispatch trip"
                        >
                          <Send className="size-4" />
                        </Button>
                      )}
                      {canManage &&
                        (t.status === TRIP_STATUS.DRAFT || t.status === TRIP_STATUS.DISPATCHED) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={actionPendingId === t.id}
                            onClick={() => handleCancel(t.id)}
                            aria-label="Cancel trip"
                          >
                            <Ban className="text-destructive size-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && data.length > 0 && (
          <PaginationControls
            page={page}
            pageCount={pageCount}
            total={total}
            onPageChange={goToPage}
          />
        )}
      </Card>
    </div>
  );
}
