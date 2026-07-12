"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseForm } from "./ExpenseForm";
import { getExpense, updateExpense } from "@/services/expenseService";
import type { Expense, ExpenseInput } from "@/types/expense";
import { extractErrorMessage } from "@/libs/helper";

export function ExpenseEditView({ id }: { id: string }) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let active = true;
    getExpense(id).then((e) => {
      if (!active) return;
      if (!e) {
        setNotFoundState(true);
      } else {
        setExpense(e);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (notFoundState) notFound();

  const handleSubmit = async (values: ExpenseInput) => {
    try {
      await updateExpense(id, values);
      toast.success("Expense updated");
      router.push("/expenses");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit expense</h1>
        <p className="text-sm text-muted-foreground">Update this expense record.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          {loading || !expense ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <ExpenseForm defaultValues={expense} submitLabel="Save changes" onSubmit={handleSubmit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
