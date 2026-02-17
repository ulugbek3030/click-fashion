import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/admin/categories/[id] — update category
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
  const { parentId, gender, position, isActive, image, translations } = body;

  try {
    await prisma.category.update({
      where: { id },
      data: {
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(gender !== undefined && { gender: gender || null }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(image !== undefined && { image: image || null }),
      },
    });

    if (translations?.length) {
      for (const t of translations) {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_locale: { categoryId: id, locale: t.locale },
          },
          update: { name: t.name, slug: t.slug },
          create: {
            categoryId: id,
            locale: t.locale,
            name: t.name,
            slug: t.slug,
          },
        });
      }
    }

    const updated = await prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] — delete category
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
    // Check for products using this category
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} products use this category` },
        { status: 400 }
      );
    }

    // Check for child categories
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${childCount} child categories exist`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
