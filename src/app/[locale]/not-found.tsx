import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Search size={64} className="mx-auto mb-4 text-muted" />
      <h2 className="mb-2 text-2xl font-bold">Page not found</h2>
      <p className="mb-6 text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
      >
        Go Home
      </Link>
    </div>
  );
}
