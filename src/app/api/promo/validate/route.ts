import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/promo/validate — validate promo code
export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }

  // Check expiry
  if (promo.expiresAt && new Date() > promo.expiresAt) {
    return NextResponse.json({ error: "Promo code expired" }, { status: 400 });
  }

  // Check usage limit
  if (promo.maxUsages && promo.usedCount >= promo.maxUsages) {
    return NextResponse.json(
      { error: "Promo code usage limit reached" },
      { status: 400 }
    );
  }

  // Check minimum order total
  if (promo.minOrderTotal && orderTotal < promo.minOrderTotal) {
    return NextResponse.json(
      { error: "Order total too low for this promo code" },
      { status: 400 }
    );
  }

  // Calculate discount
  let discount = 0;
  if (promo.discountType === "PERCENT") {
    discount = Math.round(orderTotal * (promo.discountValue / 100));
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else {
    discount = promo.discountValue;
  }

  return NextResponse.json({
    valid: true,
    promoId: promo.id,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount,
  });
}
