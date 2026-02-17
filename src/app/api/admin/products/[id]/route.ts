import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/products/[id] — get single product with all relations
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: true,
      images: { orderBy: { position: "asc" } },
      variants: {
        include: {
          color: true,
          size: true,
        },
      },
      category: { include: { translations: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

// PUT /api/admin/products/[id] — update product
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
  const {
    sku,
    gender,
    lineType,
    allowPromo,
    basePrice,
    salePrice,
    isNew,
    isFeatured,
    isActive,
    releaseAt,
    categoryId,
    translations,
    images,
    variants,
  } = body;

  try {
    // Update main product
    await prisma.product.update({
      where: { id },
      data: {
        ...(sku && { sku }),
        ...(gender && { gender }),
        ...(lineType && { lineType }),
        ...(allowPromo !== undefined && { allowPromo }),
        ...(basePrice !== undefined && { basePrice }),
        ...(salePrice !== undefined && { salePrice: salePrice || null }),
        ...(isNew !== undefined && { isNew }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        ...(releaseAt !== undefined && {
          releaseAt: releaseAt ? new Date(releaseAt) : null,
        }),
        ...(categoryId && { categoryId }),
      },
    });

    // Update translations (upsert)
    if (translations?.length) {
      for (const t of translations) {
        await prisma.productTranslation.upsert({
          where: {
            productId_locale: { productId: id, locale: t.locale },
          },
          update: {
            name: t.name,
            slug: t.slug,
            description: t.description || null,
            craftDetails: t.craftDetails || null,
            metaTitle: t.metaTitle || null,
            metaDescription: t.metaDescription || null,
          },
          create: {
            productId: id,
            locale: t.locale,
            name: t.name,
            slug: t.slug,
            description: t.description || null,
            craftDetails: t.craftDetails || null,
            metaTitle: t.metaTitle || null,
            metaDescription: t.metaDescription || null,
          },
        });
      }
    }

    // Replace images if provided
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map(
            (img: { url: string; alt?: string; position?: number }) => ({
              productId: id,
              url: img.url,
              alt: img.alt || null,
              position: img.position || 0,
            })
          ),
        });
      }
    }

    // Replace variants if provided
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map(
            (v: {
              colorId: string;
              sizeId: string;
              stock: number;
              sku: string;
            }) => ({
              productId: id,
              colorId: v.colorId,
              sizeId: v.sizeId,
              stock: v.stock || 0,
              sku: v.sku,
            })
          ),
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        images: { orderBy: { position: "asc" } },
        variants: { include: { color: true, size: true } },
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] — delete product
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
