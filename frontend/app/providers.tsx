"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/libs/auth";
import type { Session } from "@/types/user";

export function Providers({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: Session | null;
}) {
  return (
    <TooltipProvider delay={200}>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      <Toaster />
    </TooltipProvider>
  );
}
