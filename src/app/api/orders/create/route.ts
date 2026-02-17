import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateIdempotencyKey } from "@/lib/utils";

// POST /api/orders/create — create a new order
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    contactName,
    contactPhone,
    contactEmail,
    deliveryType,
    deliveryAddress,
    deliveryCity,
    pickupPointId,
    promoCodeId,
    giftCertId,
    note,
    idempotencyKey,
    items, // [{ variantId, quantity }]
  } = body;

  // Validate required fields
  if (!contactName || !contactPhone || !deliveryType || !items?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (deliveryType === "COURIER" && (!deliveryAddress || !deliveryCity)) {
    return NextResponse.json(
      { error: "Address required for courier delivery" },
      { status: 400 }
    );
  }

  if (deliveryType === "PICKUP" && !pickupPointId) {
    return NextResponse.json(
      { error: "Pickup point required" },
      { status: 400 }
    );
  }

  // Idempotency check
  const key = idempotencyKey || generateIdempotencyKey();
  const existingOrder = await prisma.order.findUnique({
    where: { idempotencyKey: key },
  });
  if (existingOrder) {
    return NextResponse.json({ order: existingOrder });
  }

  // Validate stock and calculate totals
  let subtotal = 0;
  const orderItems: {
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
  }[] = [];

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json(
        { error: `Variant ${item.variantId} not found` },
        { status: 400 }
      );
    }

    if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for variant ${variant.sku}` },
        { status: 400 }
      );
    }

    const price = variant.product.salePrice ?? variant.product.basePrice;
    subtotal += price * item.quantity;

    orderItems.push({
      productId: variant.productId,
      variantId: variant.id,
      quantity: item.quantity,
      price,
    });
  }

  // Calculate discounts
  let discount = 0;
  let giftDiscount = 0;

  if (promoCodeId) {
    const promo = await prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    });
    if (promo && promo.isActive) {
      if (promo.discountType === "PERCENT") {
        discount = Math.round(subtotal * (promo.discountValue / 100));
        if (promo.maxDiscount && discount > promo.maxDiscount) {
          discount = promo.maxDiscount;
        }
      } else {
        discount = promo.discountValue;
      }
    }
  }

  if (giftCertId) {
    const gift = await prisma.giftCertificate.findUnique({
      where: { id: giftCertId },
    });
    if (gift && gift.isActive && gift.balance > 0) {
      const remaining = subtotal - discount;
      giftDiscount = Math.min(gift.balance, remaining);
    }
  }

  // Delivery fee (free for now, can be calculated later)
  const deliveryFee = 0;

  const total = Math.max(0, subtotal - discount - giftDiscount + deliveryFee);

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          idempotencyKey: key,
          status: "CREATED",
          deliveryType,
          contactName,
          contactPhone,
          contactEmail: contactEmail || null,
          deliveryAddress: deliveryType === "COURIER" ? deliveryAddress : null,
          deliveryCity: deliveryType === "COURIER" ? deliveryCity : null,
          pickupPointId: deliveryType === "PICKUP" ? pickupPointId : null,
          promoCodeId: promoCodeId || null,
          giftCertId: giftCertId || null,
          subtotal,
          deliveryFee,
          discount,
          giftDiscount,
          total,
          note: note || null,
          items: {
            create: orderItems,
          },
        },
      });

      // Increment promo usage
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Deduct gift certificate balance
      if (giftCertId && giftDiscount > 0) {
        await tx.giftCertificate.update({
          where: { id: giftCertId },
          data: { balance: { decrement: giftDiscount } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
