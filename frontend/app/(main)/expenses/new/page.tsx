"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "../_components/ExpenseForm";
import { createExpense } from "@/services/expenseService";
import type { ExpenseInput } from "@/types/expense";
import { extractErrorMessage } from "@/libs/helper";

export default function NewExpensePage() {
  const router = useRouter();

  const handleSubmit = async (values: ExpenseInput) => {
    try {
      await createExpense(values);
      toast.success("Expense created");
      router.push("/expenses");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New expense</h1>
        <p className="text-sm text-muted-foreground">Record a trip or vehicle-related expense.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <ExpenseForm submitLabel="Create expense" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
