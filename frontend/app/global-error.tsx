"use client";

import { useEffect } from "react";
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
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold text-signal-critical">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </body>
    </html>
  );
}
