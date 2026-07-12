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

export function GaugeTile({ label, value, icon: Icon, tone = "default", className }: GaugeTileProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", TONE_VALUE_CLASS[tone])}>
        {value}
      </div>
    </div>
  );
}
