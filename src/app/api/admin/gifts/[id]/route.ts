import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/admin/gifts/[id] — update gift certificate
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
    const gift = await prisma.giftCertificate.update({
      where: { id },
      data: {
        ...(body.code && { code: body.code.toUpperCase() }),
        ...(body.initialAmount !== undefined && {
          initialAmount: body.initialAmount,
        }),
        ...(body.balance !== undefined && { balance: body.balance }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.expiresAt !== undefined && {
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        }),
      },
    });

    return NextResponse.json({ gift });
  } catch (error) {
    console.error("Update gift error:", error);
    return NextResponse.json(
      { error: "Failed to update gift certificate" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gifts/[id] — delete gift certificate
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
    await prisma.giftCertificate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete gift error:", error);
    return NextResponse.json(
      { error: "Failed to delete gift certificate" },
      { status: 500 }
    );
  }
}
