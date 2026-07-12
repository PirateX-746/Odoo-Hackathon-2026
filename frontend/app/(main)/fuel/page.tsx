import { Fuel } from "lucide-react";
import { ComingSoon } from "@/app/_components/ui/ComingSoon";

export default function FuelPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Fuel Logs</h1>
        <p className="text-sm text-muted-foreground">Fuel purchases and consumption per vehicle.</p>
      </div>
      <ComingSoon
        icon={Fuel}
        title="Fuel logs — Phase 2"
        description="Fuel-up records, cost-per-km, and consumption charts land in the next build pass."
      />
    </div>
  );
}
