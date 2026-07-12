"use client";

import { useEffect, useState } from "react";
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
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { DeleteConfirmDialog } from "@/app/_components/ui/DeleteConfirmDialog";
import { TableSkeletonRows } from "@/app/_components/ui/TableSkeleton";
import { usePaginatedList } from "@/app/_hooks/usePaginatedList";
import { useAuth } from "@/libs/auth";
import { CAN_DELETE_VEHICLES, CAN_MANAGE_VEHICLES, VEHICLE_STATUS } from "@/libs/constant";
import { listVehicles, deleteVehicle, type VehicleListParams } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicle";

const ALL_STATUS = "__all__";
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

export default function VehiclesPage() {
  const { user } = useAuth();
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<Vehicle, VehicleListParams>(listVehicles);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => updateParams({ search: searchInput || undefined }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const canManage = Boolean(user && CAN_MANAGE_VEHICLES.includes(user.role));
  const canDelete = Boolean(user && CAN_DELETE_VEHICLES.includes(user.role));

  const handleDelete = async (id: string, label: string) => {
    try {
      await deleteVehicle(id);
      toast.success(`${label} deleted`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Vehicles</h1>
          <p className="text-muted-foreground text-sm">Manage your fleet&apos;s vehicles.</p>
        </div>
        {canManage && (
          <Button render={<Link href="/vehicles/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Vehicle
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search plate or name…"
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
            {Object.values(VEHICLE_STATUS).map((s) => (
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
              <TableHead className="pl-4">Plate</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Odometer</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columns={7} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-12 text-center text-sm">
                  No vehicles match your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="pl-4 font-mono text-sm">{v.registrationNumber}</TableCell>
                  <TableCell className="text-sm">{v.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.type}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.region}</TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {v.odometerKm.toLocaleString("en-IN")} km
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/vehicles/${v.id}`} />}
                        nativeButton={false}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/vehicles/${v.id}/edit`} />}
                          nativeButton={false}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <DeleteConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Trash2 className="text-destructive size-4" />
                            </Button>
                          }
                          title="Delete vehicle?"
                          description={`This will permanently remove ${v.registrationNumber} from the fleet.`}
                          onConfirm={() => handleDelete(v.id, v.registrationNumber)}
                        />
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
