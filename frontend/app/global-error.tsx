"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="text-signal-critical size-8" />
          <h1 className="text-foreground text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md text-sm">{error.message}</p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
