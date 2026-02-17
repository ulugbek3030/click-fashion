import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/admin/promo/[id] — update promo code
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const promo = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(body.code && { code: body.code.toUpperCase() }),
        ...(body.discountType && { discountType: body.discountType }),
        ...(body.discountValue !== undefined && {
          discountValue: body.discountValue,
        }),
        ...(body.minOrderTotal !== undefined && {
          minOrderTotal: body.minOrderTotal || null,
        }),
        ...(body.maxDiscount !== undefined && {
          maxDiscount: body.maxDiscount || null,
        }),
        ...(body.maxUsages !== undefined && {
          maxUsages: body.maxUsages || null,
        }),
        ...(body.startsAt && { startsAt: new Date(body.startsAt) }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ promo });
  } catch (error) {
    console.error("Update promo error:", error);
    return NextResponse.json(
      { error: "Failed to update promo code" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promo/[id] — delete promo code
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete promo error:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
