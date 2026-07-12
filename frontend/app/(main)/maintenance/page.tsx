"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, CheckCircle2 } from "lucide-react";
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
import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { TableSkeletonRows } from "@/app/_components/ui/TableSkeleton";
import { usePaginatedList } from "@/app/_hooks/usePaginatedList";
import { CAN_MANAGE_MAINTENANCE, MAINTENANCE_STATUS } from "@/libs/constant";
import {
  listMaintenanceLogs,
  closeMaintenanceLog,
  type MaintenanceListParams,
} from "@/services/maintenanceService";
import { listAllVehicles } from "@/services/vehicleService";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import type { MaintenanceLog } from "@/types/maintenance";
import type { Vehicle } from "@/types/vehicle";

const ALL_STATUS = "__all__";
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<MaintenanceLog, MaintenanceListParams>(listMaintenanceLogs);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    listAllVehicles()
      .then(setVehicles)
      .catch((err) => toast.error(extractErrorMessage(err)));
  }, []);

  const vehiclePlate = useCallback(
    (id: string) => vehicles.find((v) => v.id === id)?.registrationNumber ?? "—",
    [vehicles],
  );

  const canManage = Boolean(user && CAN_MANAGE_MAINTENANCE.includes(user.role));

  const handleClose = async (id: string) => {
    setClosingId(id);
    try {
      await closeMaintenanceLog(id);
      toast.success("Maintenance log closed");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Maintenance</h1>
          <p className="text-muted-foreground text-sm">Service logs and scheduled maintenance.</p>
        </div>
        {canManage && (
          <Button render={<Link href="/maintenance/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Log
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            {Object.values(MAINTENANCE_STATUS).map((s) => (
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
              <TableHead className="pl-4">Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Opened</TableHead>
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
                  No maintenance logs match your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-4 font-mono text-sm">
                    {vehiclePlate(log.vehicleId)}
                  </TableCell>
                  <TableCell className="text-sm">{log.type}</TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">
                    ₹{log.cost.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(log.openedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/maintenance/${log.id}`} />}
                        nativeButton={false}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canManage && log.status === MAINTENANCE_STATUS.ACTIVE && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={closingId === log.id}
                          onClick={() => handleClose(log.id)}
                          aria-label="Close maintenance log"
                        >
                          <CheckCircle2 className="size-4" />
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
