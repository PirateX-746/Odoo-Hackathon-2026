"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { DeleteConfirmDialog } from "@/app/_components/ui/DeleteConfirmDialog";
import { usePaginatedList } from "@/app/_hooks/usePaginatedList";
import { CAN_MANAGE_FUEL_LOGS } from "@/libs/constant";
import { listFuelLogs, deleteFuelLog, type FuelLogListParams } from "@/services/fuelLogService";
import { listAllVehicles } from "@/services/vehicleService";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import type { FuelLog } from "@/types/fuelLog";
import type { Vehicle } from "@/types/vehicle";

const ALL_VEHICLES = "__all__";

export default function FuelPage() {
  const { user } = useAuth();
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<FuelLog, FuelLogListParams>(listFuelLogs);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    listAllVehicles().then(setVehicles);
  }, []);

  const vehiclePlate = useCallback(
    (id: string) => vehicles.find((v) => v.id === id)?.registrationNumber ?? "—",
    [vehicles],
  );

  const canManage = Boolean(user && CAN_MANAGE_FUEL_LOGS.includes(user.role));

  const handleDelete = async (id: string) => {
    try {
      await deleteFuelLog(id);
      toast.success("Fuel log deleted");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Fuel Logs</h1>
          <p className="text-sm text-muted-foreground">Fuel purchases and consumption per vehicle.</p>
        </div>
        {canManage && (
          <Button render={<Link href="/fuel/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Fuel Log
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={(params.vehicleId as string | undefined) ?? ALL_VEHICLES}
          onValueChange={(v) => updateParams({ vehicleId: !v || v === ALL_VEHICLES ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue>
              {(value: string) =>
                value === ALL_VEHICLES
                  ? "All vehicles"
                  : (vehicles.find((v) => v.id === value)?.registrationNumber ?? "All vehicles")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VEHICLES}>All vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.registrationNumber} — {v.name}
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
            No fuel logs match your filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Liters</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-4 font-mono text-sm">{vehiclePlate(log.vehicleId)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(log.date)}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">{log.liters} L</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    ₹{log.cost.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="pr-4">
                    {canManage && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/fuel/${log.id}/edit`} />}
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
                          title="Delete fuel log?"
                          description="This will permanently remove this fuel log entry."
                          onConfirm={() => handleDelete(log.id)}
                        />
                      </div>
                    )}
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
