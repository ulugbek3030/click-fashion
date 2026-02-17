import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/pickup-points — list all pickup points
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const points = await prisma.pickupPoint.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  });

  return NextResponse.json({ points });
}

// POST /api/admin/pickup-points — create a pickup point
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, nameUz, nameEn, address, addressUz, addressEn, lat, lng, phone, isActive } =
    body;

  if (!name || !address) {
    return NextResponse.json(
      { error: "Name and address are required" },
      { status: 400 }
    );
  }

  try {
    const point = await prisma.pickupPoint.create({
      data: {
        name,
        nameUz: nameUz || null,
        nameEn: nameEn || null,
        address,
        addressUz: addressUz || null,
        addressEn: addressEn || null,
        lat: lat || null,
        lng: lng || null,
        phone: phone || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ point }, { status: 201 });
  } catch (error) {
    console.error("Create pickup point error:", error);
    return NextResponse.json(
      { error: "Failed to create pickup point" },
      { status: 500 }
    );
  }
}
