"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColorSelector, SizeSelector, AddToCartButton } from "@/components/product";

interface ProductActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
  basePrice: number;
  salePrice: number | null;
  mainImage: string;
  colors: { id: string; name: string; hexCode: string; nameLocalized: string }[];
  sizes: { id: string; name: string }[];
  variants: {
    id: string;
    sku: string;
    colorId: string;
    sizeId: string;
    stock: number;
  }[];
  sizesForColor: Record<string, string[]>;
}

export default function ProductActions({
  productId,
  productName,
  productSlug,
  basePrice,
  salePrice,
  mainImage,
  colors,
  sizes,
  variants,
  sizesForColor,
}: ProductActionsProps) {
  const t = useTranslations("product");
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0]?.id || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Available sizes for selected color
  const availableSizeIds = selectedColor
    ? sizesForColor[selectedColor] || []
    : [];

  const sizeOptions = sizes.map((s) => ({
    ...s,
    inStock: availableSizeIds.includes(s.id),
  }));

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return (
      variants.find(
        (v) => v.colorId === selectedColor && v.sizeId === selectedSize
      ) || null
    );
  }, [selectedColor, selectedSize, variants]);

  const selectedColorData = colors.find((c) => c.id === selectedColor);
  const selectedSizeData = sizes.find((s) => s.id === selectedSize);

  return (
    <div className="space-y-6">
      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("selectColor")}
            {selectedColorData && (
              <span className="ml-2 text-muted">
                — {selectedColorData.nameLocalized}
              </span>
            )}
          </p>
          <ColorSelector
            colors={colors}
            selectedColor={selectedColor}
            onSelect={(colorId) => {
              setSelectedColor(colorId);
              setSelectedSize(null);
            }}
          />
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">
              {t("selectSize")}
              {selectedSizeData && (
                <span className="ml-2 text-muted">
                  — {selectedSizeData.name}
                </span>
              )}
            </p>
            <button className="text-xs text-muted underline hover:text-foreground transition-colors">
              {t("sizeGuide")}
            </button>
          </div>
          <SizeSelector
            sizes={sizeOptions}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />
        </div>
      )}

      {/* Stock status */}
      {selectedVariant && (
        <p className="text-sm text-success">{t("inStock")}</p>
      )}

      {/* Add to cart */}
      <AddToCartButton
        productId={productId}
        variantId={selectedVariant?.id || null}
        name={productName}
        slug={productSlug}
        price={basePrice}
        salePrice={salePrice}
        image={mainImage}
        color={selectedColorData?.nameLocalized || ""}
        colorHex={selectedColorData?.hexCode || ""}
        size={selectedSizeData?.name || ""}
        variantSku={selectedVariant?.sku || ""}
        disabled={!selectedVariant}
      />
    </div>
  );
}
