import { differenceInCalendarDays } from "date-fns";
import { EXPIRY_WARNING_WINDOW_DAYS, VEHICLE_STATUS, TRIP_STATUS } from "@/libs/constant";
import { listAllVehicles } from "./vehicleService";
import { listAllDrivers } from "./driverService";
import { listAllTrips } from "./tripService";

export interface ExpiryAlert {
  id: string;
  kind: "VEHICLE_DOC" | "DRIVER_LICENSE";
  label: string;
  subLabel: string;
  expiresOn: string;
  daysRemaining: number;
  severity: "warn" | "critical";
  href: string;
}

export async function getExpiryAlerts(): Promise<ExpiryAlert[]> {
  const [vehicles, drivers] = await Promise.all([listAllVehicles(), listAllDrivers()]);
  const alerts: ExpiryAlert[] = [];
  const today = new Date();

  for (const vehicle of vehicles) {
    for (const doc of vehicle.documents) {
      const daysRemaining = differenceInCalendarDays(new Date(doc.expiresOn), today);
      if (daysRemaining <= EXPIRY_WARNING_WINDOW_DAYS) {
        alerts.push({
          id: `${vehicle.id}-${doc.id}`,
          kind: "VEHICLE_DOC",
          label: `${vehicle.registrationNumber} · ${doc.type}`,
          subLabel: `${vehicle.make} ${vehicle.model}`,
          expiresOn: doc.expiresOn,
          daysRemaining,
          severity: daysRemaining < 0 ? "critical" : "warn",
          href: `/vehicles/${vehicle.id}`,
        });
      }
    }
  }

  for (const driver of drivers) {
    const daysRemaining = differenceInCalendarDays(
      new Date(driver.licenseExpiresOn),
      today,
    );
    if (daysRemaining <= EXPIRY_WARNING_WINDOW_DAYS) {
      alerts.push({
        id: `${driver.id}-license`,
        kind: "DRIVER_LICENSE",
        label: `${driver.name} · License`,
        subLabel: driver.licenseNumber,
        expiresOn: driver.licenseExpiresOn,
        daysRemaining,
        severity: daysRemaining < 0 ? "critical" : "warn",
        href: `/drivers/${driver.id}`,
      });
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export interface FleetSummary {
  activeVehicles: number;
  inShopVehicles: number;
  expiringDocs: number;
  activeTrips: number;
}

export async function getFleetSummary(): Promise<FleetSummary> {
  const [vehicles, trips, alerts] = await Promise.all([
    listAllVehicles(),
    listAllTrips(),
    getExpiryAlerts(),
  ]);

  return {
    activeVehicles: vehicles.filter((v) => v.status === VEHICLE_STATUS.ACTIVE).length,
    inShopVehicles: vehicles.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length,
    expiringDocs: alerts.length,
    activeTrips: trips.filter((t) => t.status === TRIP_STATUS.IN_PROGRESS).length,
  };
}
