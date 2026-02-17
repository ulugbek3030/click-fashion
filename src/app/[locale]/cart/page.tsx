"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4 text-muted" />
        <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-8 text-muted">{t("empty")}</p>
        <Link href="/catalog/women">
          <Button>{t("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 py-6 first:pt-0">
                {/* Image */}
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-neutral-100 sm:h-40 sm:w-32"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  )}
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="text-sm font-medium hover:underline sm:text-base">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {item.color} / {item.size}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.variantSku}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-destructive transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.salePrice ? (
                        <>
                          <p className="text-sm font-semibold text-destructive">
                            {formatPrice(item.salePrice * item.quantity)}
                          </p>
                          <p className="text-xs text-muted line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold">{t("total")}</h2>

            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">
                  {t("items")} ({getItemCount()})
                </span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>

            <div className="flex justify-between py-4 text-base font-semibold">
              <span>{t("total")}</span>
              <span>{formatPrice(getTotal())}</span>
            </div>

            <Link href="/checkout">
              <Button
                fullWidth
                className="flex items-center justify-center gap-2"
              >
                {t("checkout")}
                <ArrowRight size={16} />
              </Button>
            </Link>

            <Link
              href="/catalog/women"
              className="mt-4 block text-center text-sm text-muted hover:text-foreground transition-colors"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
