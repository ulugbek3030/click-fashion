import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import { Badge } from "@/components/ui";
import { ImageGallery } from "@/components/product";
import { formatPriceLocalized } from "@/lib/utils";
import ProductActions from "./ProductActions";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations("product");
  const tNav = await getTranslations("nav");

  // Find product by slug
  const translation = await prisma.productTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" } },
          variants: {
            where: { stock: { gt: 0 } },
            include: { color: true, size: true },
          },
          category: {
            include: {
              translations: { where: { locale } },
            },
          },
        },
      },
    },
  });

  if (!translation || !translation.product.isActive) {
    notFound();
  }

  const product = translation.product;

  // Build unique colors and sizes with stock info
  const colorsMap = new Map<
    string,
    { id: string; name: string; hexCode: string; nameLocalized: string }
  >();
  const sizesForColor = new Map<string, Set<string>>();

  for (const v of product.variants) {
    if (!colorsMap.has(v.color.id)) {
      const nameLocalized =
        locale === "uz"
          ? v.color.nameUz || v.color.name
          : locale === "en"
          ? v.color.nameEn || v.color.name
          : v.color.name;

      colorsMap.set(v.color.id, {
        id: v.color.id,
        name: v.color.name,
        hexCode: v.color.hexCode,
        nameLocalized,
      });
    }

    if (!sizesForColor.has(v.color.id)) {
      sizesForColor.set(v.color.id, new Set());
    }
    sizesForColor.get(v.color.id)!.add(v.size.id);
  }

  const colors = Array.from(colorsMap.values());

  // All unique sizes (for display)
  const allSizes = new Map<string, { id: string; name: string }>();
  for (const v of product.variants) {
    if (!allSizes.has(v.size.id)) {
      allSizes.set(v.size.id, { id: v.size.id, name: v.size.name });
    }
  }

  const categoryName = product.category.translations[0]?.name || "";

  const breadcrumbs = [
    { label: tNav("home"), href: "/" },
    {
      label:
        product.gender === "WOMEN" ? tNav("women") : tNav("men"),
      href: `/catalog/${product.gender.toLowerCase()}`,
    },
    ...(categoryName
      ? [
          {
            label: categoryName,
            href: `/catalog/${product.gender.toLowerCase()}?category=${product.categoryId}`,
          },
        ]
      : []),
    { label: translation.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Gallery */}
        <ImageGallery images={product.images} />

        {/* Product info */}
        <div>
          {/* Badges */}
          <div className="mb-3 flex gap-2">
            {product.isNew && <Badge variant="new">{t("new")}</Badge>}
            {product.salePrice && <Badge variant="sale">{t("sale")}</Badge>}
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {translation.name}
          </h1>

          {/* Price */}
          <div className="mb-6 flex items-center gap-3">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-bold text-destructive">
                  {formatPriceLocalized(product.salePrice, locale)}
                </span>
                <span className="text-lg text-muted line-through">
                  {formatPriceLocalized(product.basePrice, locale)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">
                {formatPriceLocalized(product.basePrice, locale)}
              </span>
            )}
          </div>

          {/* Variant selector + Add to cart */}
          <ProductActions
            productId={product.id}
            productName={translation.name}
            productSlug={slug}
            basePrice={product.basePrice}
            salePrice={product.salePrice}
            mainImage={product.images[0]?.url || ""}
            colors={colors}
            sizes={Array.from(allSizes.values())}
            variants={product.variants.map((v) => ({
              id: v.id,
              sku: v.sku,
              colorId: v.color.id,
              sizeId: v.size.id,
              stock: v.stock,
            }))}
            sizesForColor={Object.fromEntries(
              Array.from(sizesForColor.entries()).map(([k, v]) => [
                k,
                Array.from(v),
              ])
            )}
          />

          {/* SKU */}
          <p className="mt-6 text-xs text-muted">
            {t("sku")}: {product.sku}
          </p>

          {/* Description */}
          {translation.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                {t("description")}
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                {translation.description}
              </p>
            </div>
          )}

          {/* Craft details */}
          {translation.craftDetails && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                {t("craftDetails")}
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                {translation.craftDetails}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
