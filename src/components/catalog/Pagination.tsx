"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center border border-border hover:bg-muted/10 transition-colors"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={cn(
            "flex h-9 w-9 items-center justify-center text-sm transition-colors",
            page === currentPage
              ? "bg-foreground text-background"
              : "border border-border hover:bg-muted/10"
          )}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center border border-border hover:bg-muted/10 transition-colors"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
