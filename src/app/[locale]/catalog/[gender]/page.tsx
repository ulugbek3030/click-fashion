import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductGrid } from "@/components/catalog";
import { SortDropdown } from "@/components/catalog";
import { FilterSidebar } from "@/components/catalog";
import { Pagination } from "@/components/catalog";
import { Breadcrumbs } from "@/components/layout";
import { Suspense } from "react";

const ITEMS_PER_PAGE = 12;

const validGenders = ["men", "women"] as const;

interface CatalogPageProps {
  params: Promise<{ locale: string; gender: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { locale, gender } = await params;
  const search = await searchParams;

  if (!validGenders.includes(gender as "men" | "women")) {
    notFound();
  }

  const genderEnum = gender.toUpperCase() as "MEN" | "WOMEN";
  const t = await getTranslations("catalog");
  const tNav = await getTranslations("nav");

  // Parse search params
  const page = Math.max(1, parseInt(String(search.page || "1"), 10));
  const sort = String(search.sort || "newest");
  const colorFilter = search.colors
    ? String(search.colors).split(",").filter(Boolean)
    : [];
  const sizeFilter = search.sizes
    ? String(search.sizes).split(",").filter(Boolean)
    : [];
  const categoryFilter = search.category ? String(search.category) : undefined;

  // Build where clause
  const where: Record<string, unknown> = {
    isActive: true,
    gender: genderEnum,
  };

  if (categoryFilter) {
    where.categoryId = categoryFilter;
  }

  if (colorFilter.length > 0 || sizeFilter.length > 0) {
    where.variants = {
      some: {
        ...(colorFilter.length > 0 && { colorId: { in: colorFilter } }),
        ...(sizeFilter.length > 0 && { sizeId: { in: sizeFilter } }),
        stock: { gt: 0 },
      },
    };
  }

  // Sort
  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "popular":
      orderBy = { isFeatured: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // Fetch products
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: where as never,
      orderBy: orderBy as never,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        translations: { where: { locale } },
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: {
          where: { stock: { gt: 0 } },
          include: { color: true, size: true },
        },
      },
    }),
    prisma.product.count({ where: where as never }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch filter data
  const [categories, colors, sizes] = await Promise.all([
    prisma.category.findMany({
      where: { gender: genderEnum, isActive: true },
      include: {
        translations: { where: { locale } },
        _count: { select: { products: true } },
      },
      orderBy: { position: "asc" },
    }),
    prisma.color.findMany({ orderBy: { position: "asc" } }),
    prisma.size.findMany({ orderBy: { position: "asc" } }),
  ]);

  // Map products for ProductGrid
  const gridProducts = products.map((p) => {
    const translation = p.translations[0];
    const uniqueColors = new Map<string, { hexCode: string; name: string }>();
    for (const v of p.variants) {
      if (!uniqueColors.has(v.color.id)) {
        uniqueColors.set(v.color.id, {
          hexCode: v.color.hexCode,
          name: v.color.name,
        });
      }
    }

    return {
      id: p.id,
      slug: translation?.slug || p.sku,
      name: translation?.name || p.sku,
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      imageUrl: p.images[0]?.url || "",
      imageAlt: p.images[0]?.alt || undefined,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      colors: Array.from(uniqueColors.values()),
    };
  });

  // Map filter data
  const filterCategories = categories.map((c) => ({
    id: c.id,
    name: c.translations[0]?.name || "—",
    count: c._count.products,
  }));

  const filterColors = colors.map((c) => ({
    id: c.id,
    name: locale === "uz" ? (c.nameUz || c.name) : locale === "en" ? (c.nameEn || c.name) : c.name,
    hexCode: c.hexCode,
  }));

  const filterSizes = sizes.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const genderLabel = gender === "women" ? tNav("women") : tNav("men");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs
        items={[
          { label: tNav("home"), href: "/" },
          { label: genderLabel },
        ]}
        className="mb-6"
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {genderLabel}
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:block">
            {t("productsCount", { count: String(totalCount) })}
          </span>
          <Suspense fallback={null}>
            <SortDropdown />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar - desktop */}
        <Suspense fallback={null}>
          <FilterSidebar
            categories={filterCategories}
            colors={filterColors}
            sizes={filterSizes}
            className="hidden w-56 shrink-0 lg:block"
          />
        </Suspense>

        {/* Products */}
        <div className="flex-1">
          {gridProducts.length > 0 ? (
            <>
              <ProductGrid products={gridProducts} />
              <Suspense fallback={null}>
                <Pagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            </>
          ) : (
            <div className="py-20 text-center text-muted">
              {t("noProducts")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
