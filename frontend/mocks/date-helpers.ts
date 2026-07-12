import { addDays, addHours, subDays, formatISO } from "date-fns";

// Mock fixtures anchor every date to "now" so expiry/alert states
// (expiring-soon, overdue, upcoming trips) look correct whenever the demo runs.
export const daysFromNow = (n: number): string =>
  formatISO(addDays(new Date(), n), { representation: "date" });

export const daysAgo = (n: number): string =>
  formatISO(subDays(new Date(), n), { representation: "date" });

export const hoursFromNow = (n: number): string =>
  addHours(new Date(), n).toISOString();
