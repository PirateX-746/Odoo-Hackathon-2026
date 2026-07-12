"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/libs/auth";
import { APP_NAME } from "@/libs/constant";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <nav className={cn("flex h-full flex-col gap-1 bg-sidebar p-3", className)}>
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex size-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
          <Gauge className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-sidebar-foreground uppercase">
          {APP_NAME}
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
