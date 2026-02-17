import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/orders — list orders with pagination and filters
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { contactName: { contains: search, mode: "insensitive" } },
      { contactPhone: { contains: search } },
      { id: { contains: search } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              include: {
                translations: { where: { locale: "ru" } },
                images: { take: 1 },
              },
            },
            variant: { include: { color: true, size: true } },
          },
        },
        payments: true,
        pickupPoint: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    total,
    pages: Math.ceil(total / limit),
  });
}
