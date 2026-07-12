import { Wrench } from "lucide-react";
import { ComingSoon } from "@/app/_components/ui/ComingSoon";

export default function MaintenancePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Maintenance</h1>
        <p className="text-sm text-muted-foreground">Service logs and scheduled maintenance.</p>
      </div>
      <ComingSoon
        icon={Wrench}
        title="Maintenance logs — Phase 2"
        description="Service history, scheduled maintenance, and cost tracking land in the next build pass."
      />
    </div>
  );
}
