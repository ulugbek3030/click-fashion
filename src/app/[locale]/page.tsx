import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { ProductGrid } from "@/components/catalog";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  // Fetch new arrivals
  const newProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      translations: { where: { locale } },
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: {
        where: { stock: { gt: 0 } },
        include: { color: true },
      },
    },
  });

  const gridProducts = newProducts.map((p) => {
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

  return (
    <div>
      {/* Hero section */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-neutral-100">
        <div className="text-center px-4">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mb-8 text-lg text-muted sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <Link
            href="/catalog/women"
            className="inline-flex items-center gap-2 bg-foreground px-8 py-3 text-sm font-medium uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
          >
            {t("shopNow")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Categories section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
          {t("categories")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/catalog/women"
            className="group relative flex h-80 items-end overflow-hidden bg-neutral-200 p-6"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-foreground">
                {tNav("women")}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted group-hover:text-foreground transition-colors">
                {t("shopNow")} <ArrowRight size={14} />
              </span>
            </div>
          </Link>
          <Link
            href="/catalog/men"
            className="group relative flex h-80 items-end overflow-hidden bg-neutral-300 p-6"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-foreground">
                {tNav("men")}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-muted group-hover:text-foreground transition-colors">
                {t("shopNow")} <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* New Arrivals section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("newArrivals")}
          </h2>
          <Link
            href="/catalog/women?sort=newest"
            className="flex items-center gap-1 text-sm font-medium hover:text-muted transition-colors"
          >
            {t("shopNow")} <ArrowRight size={14} />
          </Link>
        </div>
        {gridProducts.length > 0 ? (
          <ProductGrid products={gridProducts} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse bg-neutral-100"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
