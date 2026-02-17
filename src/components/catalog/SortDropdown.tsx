"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "newest", key: "sortNewest" },
  { value: "price_asc", key: "sortPriceAsc" },
  { value: "price_desc", key: "sortPriceDesc" },
  { value: "popular", key: "sortPopular" },
] as const;

export default function SortDropdown() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">{t("sort")}:</span>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="border border-border bg-background px-3 py-1.5 text-sm focus:border-foreground focus:outline-none"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.key)}
          </option>
        ))}
      </select>
    </div>
  );
}
