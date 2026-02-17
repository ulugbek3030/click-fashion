import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/gifts — list all gift certificates
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gifts = await prisma.giftCertificate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return NextResponse.json({ gifts });
}

// POST /api/admin/gifts — create a gift certificate
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, initialAmount, expiresAt, isActive } = body;

  if (!code || !initialAmount) {
    return NextResponse.json(
      { error: "Code and initialAmount are required" },
      { status: 400 }
    );
  }

  try {
    const gift = await prisma.giftCertificate.create({
      data: {
        code: code.toUpperCase(),
        initialAmount,
        balance: initialAmount,
        isActive: isActive !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ gift }, { status: 201 });
  } catch (error) {
    console.error("Create gift error:", error);
    return NextResponse.json(
      { error: "Failed to create gift certificate" },
      { status: 500 }
    );
  }
}
