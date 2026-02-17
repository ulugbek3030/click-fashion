"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
      <h2 className="mb-2 text-xl font-bold">Admin Error</h2>
      <p className="mb-4 text-sm text-muted">
        {error.message || "An unexpected error occurred in the admin panel."}
      </p>
      <button
        onClick={reset}
        className="bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90"
      >
        Try again
      </button>
    </div>
  );
}
