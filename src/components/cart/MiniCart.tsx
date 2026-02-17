"use client";

import { useTranslations } from "next-intl";
import { Drawer } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default function MiniCart() {
  const t = useTranslations("cart");
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } =
    useCartStore();

  return (
    <Drawer isOpen={isOpen} onClose={closeCart} title={t("title")} side="right">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-muted">{t("empty")}</p>
          <Link href="/catalog/women" onClick={closeCart}>
            <Button variant="outline">{t("continueShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {/* Items */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3 border-b border-border pb-4">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-muted/10">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.color} / {item.size}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatPrice(item.salePrice ?? item.price)}
                  </p>
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center border border-border hover:bg-muted/10"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[20px] text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center border border-border hover:bg-muted/10"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-auto p-1 text-muted hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">{t("total")}</span>
              <span className="font-semibold">{formatPrice(getTotal())}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button fullWidth>{t("checkout")}</Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
