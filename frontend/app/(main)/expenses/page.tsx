import { Receipt } from "lucide-react";
import { ComingSoon } from "@/app/_components/ui/ComingSoon";

export default function ExpensesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground">Trip and vehicle-related spend.</p>
      </div>
      <ComingSoon
        icon={Receipt}
        title="Expenses — Phase 2"
        description="Expense entries, approvals, and PDF exports land in the next build pass."
      />
    </div>
  );
}
