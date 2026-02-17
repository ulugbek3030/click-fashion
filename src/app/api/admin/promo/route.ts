import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/promo — list all promo codes
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return NextResponse.json({ promoCodes });
}

// POST /api/admin/promo — create a promo code
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    code,
    discountType,
    discountValue,
    minOrderTotal,
    maxDiscount,
    maxUsages,
    startsAt,
    expiresAt,
    isActive,
  } = body;

  if (!code || !discountType || !discountValue) {
    return NextResponse.json(
      { error: "Code, discountType, and discountValue are required" },
      { status: 400 }
    );
  }

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderTotal: minOrderTotal || null,
        maxDiscount: maxDiscount || null,
        maxUsages: maxUsages || null,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    console.error("Create promo error:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}
