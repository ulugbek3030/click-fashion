import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductGrid } from "@/components/catalog";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface WishlistPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  const t = await getTranslations("nav");
  const tCart = await getTranslations("cart");
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
    return null;
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          translations: { where: { locale } },
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: {
            where: { stock: { gt: 0 } },
            include: { color: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map((wi) => {
    const tr = wi.product.translations[0];
    const uniqueColors = new Map<string, { hexCode: string; name: string }>();
    for (const v of wi.product.variants) {
      if (!uniqueColors.has(v.color.id)) {
        uniqueColors.set(v.color.id, {
          hexCode: v.color.hexCode,
          name: v.color.name,
        });
      }
    }
    return {
      id: wi.product.id,
      slug: tr?.slug || wi.product.sku,
      name: tr?.name || wi.product.sku,
      basePrice: wi.product.basePrice,
      salePrice: wi.product.salePrice,
      imageUrl: wi.product.images[0]?.url || "",
      imageAlt: wi.product.images[0]?.alt || undefined,
      isNew: wi.product.isNew,
      isFeatured: wi.product.isFeatured,
      colors: Array.from(uniqueColors.values()),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        {t("wishlist")}
      </h1>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="py-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-muted" />
          <p className="mb-8 text-muted">
            {locale === "ru"
              ? "Список избранного пуст"
              : locale === "uz"
                ? "Sevimlilar ro'yxati bo'sh"
                : "Your wishlist is empty"}
          </p>
          <Link
            href="/catalog/women"
            className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
          >
            {tCart("continueShopping")}
          </Link>
        </div>
      )}
    </div>
  );
}
