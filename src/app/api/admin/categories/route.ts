import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/categories — list all categories with hierarchy
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    include: {
      translations: true,
      parent: { include: { translations: { where: { locale: "ru" } } } },
      _count: { select: { products: true, children: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ categories });
}

// POST /api/admin/categories — create a category
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { parentId, gender, position, isActive, image, translations } = body;

  if (!translations?.length) {
    return NextResponse.json(
      { error: "At least one translation is required" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: {
        parentId: parentId || null,
        gender: gender || null,
        position: position || 0,
        isActive: isActive !== false,
        image: image || null,
        translations: {
          create: translations.map(
            (t: { locale: string; name: string; slug: string }) => ({
              locale: t.locale,
              name: t.name,
              slug: t.slug,
            })
          ),
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
