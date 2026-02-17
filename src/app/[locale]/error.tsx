"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <AlertTriangle size={64} className="mx-auto mb-4 text-red-500" />
      <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
      <p className="mb-6 text-sm text-muted">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
      >
        Try again
      </button>
    </div>
  );
}
