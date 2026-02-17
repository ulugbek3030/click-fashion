"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface ColorOption extends FilterOption {
  hexCode: string;
}

interface FilterSidebarProps {
  categories: FilterOption[];
  colors: ColorOption[];
  sizes: FilterOption[];
  className?: string;
}

export default function FilterSidebar({
  categories,
  colors,
  sizes,
  className,
}: FilterSidebarProps) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedColors = searchParams.get("colors")?.split(",") || [];
  const selectedSizes = searchParams.get("sizes")?.split(",") || [];
  const selectedCategory = searchParams.get("category") || "";

  function toggleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) || [];

    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    if (updated.length > 0) {
      params.set(key, updated.join(","));
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasFilters =
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    selectedCategory;

  return (
    <aside className={cn("space-y-6", className)}>
      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-muted underline hover:text-foreground transition-colors"
        >
          {t("clearFilters")}
        </button>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
            {t("category")}
          </h3>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id === selectedCategory ? "" : cat.id)}
                className={cn(
                  "block w-full text-left text-sm transition-colors",
                  cat.id === selectedCategory
                    ? "font-medium text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                {cat.name}
                {cat.count !== undefined && (
                  <span className="ml-1 text-muted-foreground">({cat.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
            {t("color")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => toggleFilter("colors", color.id)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-all",
                  selectedColors.includes(color.id)
                    ? "border-foreground ring-1 ring-foreground ring-offset-1"
                    : "border-border hover:border-foreground/50"
                )}
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
            {t("size")}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => toggleFilter("sizes", size.id)}
                className={cn(
                  "flex h-9 min-w-[36px] items-center justify-center border px-2 text-sm transition-colors",
                  selectedSizes.includes(size.id)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                )}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
