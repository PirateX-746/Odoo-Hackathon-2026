"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/app/_components/layout/Sidebar";
import { Topbar } from "@/app/_components/layout/Topbar";
import { useAuth } from "@/libs/auth";
import { ROUTE_ROLES, ROUTES } from "@/libs/constant";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const restrictedEntry = Object.entries(ROUTE_ROLES).find(([route]) =>
      pathname.startsWith(route),
    );
    if (restrictedEntry && !restrictedEntry[1]?.includes(user.role)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [pathname, user, loading, router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden w-60 shrink-0 border-r border-sidebar-border md:flex" />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
