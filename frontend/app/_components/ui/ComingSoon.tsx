import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoon({ icon: Icon, title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
      <div className="flex size-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
