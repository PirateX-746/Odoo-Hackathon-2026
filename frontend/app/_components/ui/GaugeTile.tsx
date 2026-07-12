import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GaugeTileProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  index?: number;
  tone?: "default" | "warn" | "critical";
  className?: string;
}

const TONE_VALUE_CLASS: Record<NonNullable<GaugeTileProps["tone"]>, string> = {
  default: "text-foreground",
  warn: "text-signal-warn",
  critical: "text-signal-critical",
};

// Signature dashboard element: instrument-cluster styled KPI tile — condensed
// label, mono numeral, amber tick-mark underline (literal gauge/odometer nod).
export function GaugeTile({
  label,
  value,
  icon: Icon,
  index = 0,
  tone = "default",
  className,
}: GaugeTileProps) {
  return (
    <div
      className={cn(
        "origin-left rounded-lg border border-border bg-card p-4 motion-safe:animate-gauge-in",
        className,
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-3xl font-semibold tabular-nums",
          TONE_VALUE_CLASS[tone],
        )}
      >
        {value}
      </div>
      <div className="gauge-ticks mt-3 h-0.5 w-full" />
    </div>
  );
}
