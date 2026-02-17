"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/Toast";

interface AddToCartButtonProps {
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  image: string;
  color: string;
  colorHex: string;
  size: string;
  variantSku: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  variantId,
  name,
  slug,
  price,
  salePrice,
  image,
  color,
  colorHex,
  size,
  variantSku,
  disabled,
}: AddToCartButtonProps) {
  const t = useTranslations("product");
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toast } = useToast();

  function handleClick() {
    if (!variantId || disabled) return;

    addItem({
      productId,
      variantId,
      quantity: 1,
      name,
      slug,
      price,
      salePrice,
      image,
      color,
      colorHex,
      size,
      variantSku,
    });

    setAdded(true);
    toast(t("addedToCart"), "success");
    openCart();

    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      fullWidth
      size="lg"
      onClick={handleClick}
      disabled={!variantId || disabled}
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          {t("addedToCart")}
        </>
      ) : (
        <>
          <ShoppingBag className="mr-2 h-5 w-5" />
          {t("addToCart")}
        </>
      )}
    </Button>
  );
}
