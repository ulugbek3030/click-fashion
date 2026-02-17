import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/admin/pickup-points/[id] — update pickup point
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
    const point = await prisma.pickupPoint.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.nameUz !== undefined && { nameUz: body.nameUz || null }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn || null }),
        ...(body.address && { address: body.address }),
        ...(body.addressUz !== undefined && {
          addressUz: body.addressUz || null,
        }),
        ...(body.addressEn !== undefined && {
          addressEn: body.addressEn || null,
        }),
        ...(body.lat !== undefined && { lat: body.lat || null }),
        ...(body.lng !== undefined && { lng: body.lng || null }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ point });
  } catch (error) {
    console.error("Update pickup point error:", error);
    return NextResponse.json(
      { error: "Failed to update pickup point" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pickup-points/[id] — delete pickup point
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
    await prisma.pickupPoint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete pickup point error:", error);
    return NextResponse.json(
      { error: "Failed to delete pickup point" },
      { status: 500 }
    );
  }
}
