"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { DeleteConfirmDialog } from "@/app/_components/ui/DeleteConfirmDialog";
import { usePaginatedList } from "@/app/_hooks/usePaginatedList";
import { TRIP_STATUS } from "@/libs/constant";
import { listTrips, deleteTrip, type TripListParams } from "@/services/tripService";
import { listAllVehicles } from "@/services/vehicleService";
import { listAllDrivers } from "@/services/driverService";
import { formatDate } from "@/libs/helper";
import type { Trip } from "@/types/trip";
import type { Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";

const ALL_STATUS = "__all__";
const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function TripsPage() {
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<Trip, TripListParams>(listTrips);
  const [searchInput, setSearchInput] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    listAllVehicles().then(setVehicles);
    listAllDrivers().then(setDrivers);
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

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTrip(id);
      toast.success("Trip deleted");
      refetch();
    },
    [refetch],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Trips</h1>
          <p className="text-sm text-muted-foreground">Schedule and track dispatch trips.</p>
        </div>
        <Button render={<Link href="/trips/new" />} nativeButton={false}>
          <Plus className="size-4" />
          New Trip
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trip code, origin, destination…"
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
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No trips match your filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Trip</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="pl-4 font-mono text-sm">{t.tripCode}</TableCell>
                  <TableCell className="text-sm">
                    {t.origin} <span className="text-muted-foreground">→</span> {t.destination}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {vehiclePlate(t.vehicleId)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{driverName(t.driverId)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(t.scheduledStart, "en-IN", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" render={<Link href={`/trips/${t.id}`} />} nativeButton={false}>
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/trips/${t.id}/edit`} />}
                        nativeButton={false}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        }
                        title="Delete trip?"
                        description={`This will permanently remove ${t.tripCode}.`}
                        onConfirm={() => handleDelete(t.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && data.length > 0 && (
          <PaginationControls page={page} pageCount={pageCount} total={total} onPageChange={goToPage} />
        )}
      </Card>
    </div>
  );
}
