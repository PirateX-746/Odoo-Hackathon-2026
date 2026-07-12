import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Truck,
  Users as UsersIcon,
  Route,
  Wrench,
  Fuel,
  Receipt,
  UserCog,
} from "lucide-react";
import { ROUTES, ROLES, type Role } from "@/libs/constant";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[]; // omitted = every authenticated role can see it
}

export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.VEHICLES, label: "Vehicles", icon: Truck },
  { href: ROUTES.DRIVERS, label: "Drivers", icon: UsersIcon },
  { href: ROUTES.TRIPS, label: "Trips", icon: Route },
  { href: ROUTES.MAINTENANCE, label: "Maintenance", icon: Wrench },
  { href: ROUTES.FUEL, label: "Fuel Logs", icon: Fuel },
  { href: ROUTES.EXPENSES, label: "Expenses", icon: Receipt },
  { href: ROUTES.USERS, label: "Users", icon: UserCog, roles: [ROLES.ADMIN] },
];
