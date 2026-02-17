"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Something went wrong
        </h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#000",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            border: "none",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
