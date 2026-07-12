"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { differenceInCalendarDays } from "date-fns";
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
import {
  CAN_DELETE_DRIVERS,
  CAN_MANAGE_DRIVERS,
  DRIVER_STATUS,
  EXPIRY_WARNING_WINDOW_DAYS,
} from "@/libs/constant";
import { listDrivers, deleteDriver, type DriverListParams } from "@/services/driverService";
import { formatDate } from "@/libs/helper";
import type { Driver } from "@/types/driver";

const ALL_STATUS = "__all__";
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
};

export default function DriversPage() {
  const { user } = useAuth();
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<Driver, DriverListParams>(listDrivers);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => updateParams({ search: searchInput || undefined }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const canManage = Boolean(user && CAN_MANAGE_DRIVERS.includes(user.role));
  const canDelete = Boolean(user && CAN_DELETE_DRIVERS.includes(user.role));

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      try {
        await deleteDriver(id);
        toast.success(`${name} deleted`);
        refetch();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete driver");
      }
    },
    [refetch],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Drivers</h1>
          <p className="text-muted-foreground text-sm">
            Manage driver profiles and license status.
          </p>
        </div>
        {canManage && (
          <Button render={<Link href="/drivers/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Driver
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search name or license…"
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
            {Object.values(DRIVER_STATUS).map((s) => (
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
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>License #</TableHead>
              <TableHead>License expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Safety score</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columns={6} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-12 text-center text-sm">
                  No drivers match your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((d) => {
                const daysRemaining = differenceInCalendarDays(
                  new Date(d.licenseExpiryDate),
                  new Date(),
                );
                const flagged = daysRemaining <= EXPIRY_WARNING_WINDOW_DAYS;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="pl-4 text-sm font-medium">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {d.licenseNumber}
                    </TableCell>
                    <TableCell
                      className={`text-sm ${flagged ? (daysRemaining < 0 ? "text-signal-critical" : "text-signal-warn") : "text-foreground"}`}
                    >
                      {formatDate(d.licenseExpiryDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {d.safetyScore}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/drivers/${d.id}`} />}
                          nativeButton={false}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            render={<Link href={`/drivers/${d.id}/edit`} />}
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
                            title="Delete driver?"
                            description={`This will permanently remove ${d.name} from the roster.`}
                            onConfirm={() => handleDelete(d.id, d.name)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
