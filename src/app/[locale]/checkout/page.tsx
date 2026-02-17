"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Input, Select } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, generateIdempotencyKey } from "@/lib/utils";
import { ShoppingBag, MapPin, Truck, CreditCard, Tag, Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface PickupPoint {
  id: string;
  name: string;
  address: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();

  // Form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState<"COURIER" | "PICKUP">("COURIER");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Ташкент");
  const [pickupPointId, setPickupPointId] = useState("");
  const [note, setNote] = useState("");

  // Promo & Gift
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{
    promoId: string;
    discount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [giftResult, setGiftResult] = useState<{
    giftId: string;
    balance: number;
    applied: number;
  } | null>(null);
  const [giftError, setGiftError] = useState("");

  // Pickup points
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);

  // Loading
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    fetch("/api/pickup-points")
      .then((res) => res.json())
      .then((data) => setPickupPoints(data.points || []))
      .catch(() => {});
  }, []);

  const subtotal = getTotal();
  const discount = promoResult?.discount || 0;
  const giftDiscount = giftResult?.applied || 0;
  const deliveryFee = 0;
  const total = Math.max(0, subtotal - discount - giftDiscount + deliveryFee);

  async function handlePromoApply() {
    setPromoError("");
    setPromoResult(null);
    if (!promoCode.trim()) return;
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoResult({ promoId: data.promoId, discount: data.discount });
      } else {
        setPromoError(data.error || "Invalid promo code");
      }
    } catch {
      setPromoError("Error validating promo code");
    }
  }

  async function handleGiftApply() {
    setGiftError("");
    setGiftResult(null);
    if (!giftCode.trim()) return;
    try {
      const res = await fetch("/api/gift/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCode }),
      });
      const data = await res.json();
      if (data.valid) {
        const remaining = subtotal - discount;
        const applied = Math.min(data.balance, remaining);
        setGiftResult({ giftId: data.giftId, balance: data.balance, applied });
      } else {
        setGiftError(data.error || "Invalid gift certificate");
      }
    } catch {
      setGiftError("Error validating gift certificate");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOrderError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          contactPhone,
          contactEmail,
          deliveryType,
          deliveryAddress: deliveryType === "COURIER" ? deliveryAddress : undefined,
          deliveryCity: deliveryType === "COURIER" ? deliveryCity : undefined,
          pickupPointId: deliveryType === "PICKUP" ? pickupPointId : undefined,
          promoCodeId: promoResult?.promoId || undefined,
          giftCertId: giftResult?.giftId || undefined,
          note,
          idempotencyKey: generateIdempotencyKey(),
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error || "Failed to create order");
        return;
      }
      clearCart();
      router.push(`/payment/result?orderId=${data.order.id}&status=created`);
    } catch {
      setOrderError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4 text-muted" />
        <h1 className="mb-2 text-2xl font-bold">{tCart("title")}</h1>
        <p className="mb-8 text-muted">{tCart("empty")}</p>
        <Link href="/catalog/women">
          <Button>{tCart("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <section className="border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <CreditCard size={20} />
                {t("contacts")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={t("name")} value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                <Input label={t("phone")} type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required placeholder="+998" />
                <div className="sm:col-span-2">
                  <Input label={t("email")} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section className="border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Truck size={20} />
                {t("delivery")}
              </h2>
              <div className="mb-4 flex gap-2">
                <button type="button" onClick={() => setDeliveryType("COURIER")}
                  className={`flex-1 py-3 text-sm font-medium border transition-colors ${deliveryType === "COURIER" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                  <Truck size={16} className="mx-auto mb-1" />
                  {t("deliveryCourier")}
                </button>
                <button type="button" onClick={() => setDeliveryType("PICKUP")}
                  className={`flex-1 py-3 text-sm font-medium border transition-colors ${deliveryType === "PICKUP" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                  <MapPin size={16} className="mx-auto mb-1" />
                  {t("deliveryPickup")}
                </button>
              </div>

              {deliveryType === "COURIER" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label={t("city")} value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} required />
                  <div className="sm:col-span-2">
                    <Input label={t("address")} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
                  </div>
                </div>
              ) : (
                <Select
                  label={t("pickupPoint")}
                  value={pickupPointId}
                  onChange={(e) => setPickupPointId(e.target.value)}
                  required
                  options={[{ value: "", label: "—" }, ...pickupPoints.map((p) => ({ value: p.id, label: `${p.name} — ${p.address}` }))]}
                />
              )}
            </section>

            {/* Promo & Gift */}
            <section className="border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Tag size={20} />
                {t("promo")}
              </h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input placeholder={t("promoPlaceholder")} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" onClick={handlePromoApply}>{t("promoApply")}</Button>
                </div>
                {promoError && <p className="mt-1 text-xs text-destructive">{promoError}</p>}
                {promoResult && <p className="mt-1 text-xs text-success">-{formatPrice(promoResult.discount)}</p>}
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1 text-sm font-medium"><Gift size={14} />{t("gift")}</p>
                <div className="flex gap-2">
                  <Input placeholder={t("giftPlaceholder")} value={giftCode} onChange={(e) => setGiftCode(e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" onClick={handleGiftApply}>{t("promoApply")}</Button>
                </div>
                {giftError && <p className="mt-1 text-xs text-destructive">{giftError}</p>}
                {giftResult && <p className="mt-1 text-xs text-success">-{formatPrice(giftResult.applied)}</p>}
              </div>
            </section>

            {/* Note */}
            <section className="border border-border p-6">
              <label className="mb-2 block text-sm font-medium">{t("note")}</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder={t("note")} />
            </section>
          </div>

          {/* Right Column — Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">{t("summary")}</h2>
              <div className="mb-4 max-h-60 space-y-3 overflow-y-auto border-b border-border pb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-2">
                    <div className="h-12 w-9 flex-shrink-0 bg-neutral-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted">{item.color} / {item.size} &times; {item.quantity}</p>
                    </div>
                    <p className="text-xs font-medium">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">{tCart("subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>{t("discount")}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {giftDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>{t("gift")}</span>
                    <span>-{formatPrice(giftDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">{t("deliveryFee")}</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : t("free")}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <span>{t("summary")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {orderError && (
                <div className="mt-4 bg-destructive/10 p-3 text-xs text-destructive">{orderError}</div>
              )}

              <Button type="submit" fullWidth className="mt-4" disabled={submitting}>
                {submitting ? "..." : t("placeOrder")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
