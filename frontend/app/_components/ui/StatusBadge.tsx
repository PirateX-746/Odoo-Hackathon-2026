import type { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

// Covers every status enum across Vehicle/Driver/Trip/Maintenance
// (backend/prisma/schema.prisma) — status values are unique across entities
// so one shared map is safe.
const LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

const VARIANTS: Record<string, BadgeVariant> = {
  AVAILABLE: "ok",
  ON_TRIP: "ok",
  IN_SHOP: "warn",
  RETIRED: "critical",
  OFF_DUTY: "idle",
  SUSPENDED: "critical",
  DRAFT: "idle",
  DISPATCHED: "ok",
  COMPLETED: "secondary",
  CANCELLED: "critical",
  ACTIVE: "warn",
  CLOSED: "secondary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "secondary"} className={cn("font-medium", className)}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
