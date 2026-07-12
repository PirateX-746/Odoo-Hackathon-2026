"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { CAN_MANAGE_EXPENSES, EXPENSE_TYPE } from "@/libs/constant";
import { listExpenses, deleteExpense, type ExpenseListParams } from "@/services/expenseService";
import { listAllVehicles } from "@/services/vehicleService";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import type { Expense } from "@/types/expense";
import type { Vehicle } from "@/types/vehicle";

const ALL_TYPE = "__all__";
const TYPE_LABELS: Record<string, string> = {
  TOLL: "Toll",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const { data, total, loading, params, page, pageCount, updateParams, goToPage, refetch } =
    usePaginatedList<Expense, ExpenseListParams>(listExpenses);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    listAllVehicles().then(setVehicles);
  }, []);

  const vehiclePlate = useCallback(
    (id: string) => vehicles.find((v) => v.id === id)?.registrationNumber ?? "—",
    [vehicles],
  );

  const canManage = Boolean(user && CAN_MANAGE_EXPENSES.includes(user.role));

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Trip and vehicle-related spend.</p>
        </div>
        {canManage && (
          <Button render={<Link href="/expenses/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New Expense
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={(params.type as string | undefined) ?? ALL_TYPE}
          onValueChange={(v) => updateParams({ type: !v || v === ALL_TYPE ? undefined : v })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue>
              {(value: string) => (value === ALL_TYPE ? "All types" : TYPE_LABELS[value])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPE}>All types</SelectItem>
            {Object.values(EXPENSE_TYPE).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
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
            No expenses match your filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="pl-4 font-mono text-sm">
                    {vehiclePlate(expense.vehicleId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{TYPE_LABELS[expense.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="pr-4">
                    {canManage && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/expenses/${expense.id}/edit`} />}
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
                          title="Delete expense?"
                          description="This will permanently remove this expense entry."
                          onConfirm={() => handleDelete(expense.id)}
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
