"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatPriceLocalized } from "@/lib/utils";
import { useLocale } from "next-intl";

interface ProductCardProps {
  slug: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  imageUrl: string;
  imageAlt?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  colors?: { hexCode: string; name: string }[];
}

export default function ProductCard({
  slug,
  name,
  basePrice,
  salePrice,
  imageUrl,
  imageAlt,
  isNew,
  colors,
}: ProductCardProps) {
  const locale = useLocale();

  return (
    <div className="group relative">
      {/* Image */}
      <Link href={`/product/${slug}`} className="block">
        <div className="relative w-full overflow-hidden bg-neutral-100" style={{ paddingBottom: "133.33%" }}>
          <Image
            src={imageUrl}
            alt={imageAlt || name}
            fill
            className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isNew && <Badge variant="new">NEW</Badge>}
            {salePrice && <Badge variant="sale">SALE</Badge>}
          </div>

          {/* Wishlist button */}
          <button
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              // TODO: wishlist toggle
            }}
          >
            <Heart size={16} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3">
        <Link href={`/product/${slug}`}>
          <h3 className="text-sm font-medium line-clamp-1 hover:underline">
            {name}
          </h3>
        </Link>

        {/* Colors */}
        {colors && colors.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {colors.slice(0, 5).map((color) => (
              <span
                key={color.hexCode}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-xs text-muted">+{colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-1.5 flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="text-sm font-semibold text-destructive">
                {formatPriceLocalized(salePrice, locale)}
              </span>
              <span className="text-xs text-muted line-through">
                {formatPriceLocalized(basePrice, locale)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {formatPriceLocalized(basePrice, locale)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
