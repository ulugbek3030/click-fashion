import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/gift/validate — validate gift certificate
export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const gift = await prisma.giftCertificate.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!gift || !gift.isActive) {
    return NextResponse.json(
      { error: "Invalid gift certificate" },
      { status: 404 }
    );
  }

  if (gift.expiresAt && new Date() > gift.expiresAt) {
    return NextResponse.json(
      { error: "Gift certificate expired" },
      { status: 400 }
    );
  }

  if (gift.balance <= 0) {
    return NextResponse.json(
      { error: "Gift certificate has no balance" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    giftId: gift.id,
    balance: gift.balance,
  });
}
