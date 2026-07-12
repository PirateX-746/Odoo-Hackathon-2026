import { differenceInCalendarDays } from "date-fns";
import { EXPIRY_WARNING_WINDOW_DAYS } from "@/libs/constant";
import { listAllDrivers } from "./driverService";

export interface ExpiryAlert {
  id: string;
  kind: "DRIVER_LICENSE";
  label: string;
  subLabel: string;
  expiresOn: string;
  daysRemaining: number;
  severity: "warn" | "critical";
  href: string;
}

// Vehicles have no document/expiry fields in the real schema (backend/prisma/schema.prisma)
// — only driver licenses carry an expiry date, so this is the only alert source.
export async function getExpiryAlerts(): Promise<ExpiryAlert[]> {
  const drivers = await listAllDrivers();
  const alerts: ExpiryAlert[] = [];
  const today = new Date();

  for (const driver of drivers) {
    const daysRemaining = differenceInCalendarDays(new Date(driver.licenseExpiryDate), today);
    if (daysRemaining <= EXPIRY_WARNING_WINDOW_DAYS) {
      alerts.push({
        id: `${driver.id}-license`,
        kind: "DRIVER_LICENSE",
        label: `${driver.name} · License`,
        subLabel: driver.licenseNumber,
        expiresOn: driver.licenseExpiryDate,
        daysRemaining,
        severity: daysRemaining < 0 ? "critical" : "warn",
        href: `/drivers/${driver.id}`,
      });
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
