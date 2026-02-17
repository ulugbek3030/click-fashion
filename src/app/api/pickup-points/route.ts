import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pickup-points — list active pickup points
export async function GET() {
  const points = await prisma.pickupPoint.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ points });
}
