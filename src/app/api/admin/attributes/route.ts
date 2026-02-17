import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/attributes — get colors and sizes (for product form dropdowns)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [colors, sizes] = await Promise.all([
    prisma.color.findMany({ orderBy: { position: "asc" } }),
    prisma.size.findMany({ orderBy: { position: "asc" } }),
  ]);

  return NextResponse.json({ colors, sizes });
}
