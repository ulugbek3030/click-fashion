import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/wishlist — get wishlist items
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          translations: true,
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: {
            where: { stock: { gt: 0 } },
            include: { color: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = wishlistItems.map((wi) => {
    const t = wi.product.translations[0];
    const uniqueColors = new Map<string, { hexCode: string; name: string }>();
    for (const v of wi.product.variants) {
      if (!uniqueColors.has(v.color.id)) {
        uniqueColors.set(v.color.id, {
          hexCode: v.color.hexCode,
          name: v.color.name,
        });
      }
    }

    return {
      id: wi.id,
      productId: wi.productId,
      slug: t?.slug || wi.product.sku,
      name: t?.name || wi.product.sku,
      basePrice: wi.product.basePrice,
      salePrice: wi.product.salePrice,
      imageUrl: wi.product.images[0]?.url || "",
      imageAlt: wi.product.images[0]?.alt || undefined,
      isNew: wi.product.isNew,
      isFeatured: wi.product.isFeatured,
      colors: Array.from(uniqueColors.values()),
    };
  });

  return NextResponse.json({ items });
}

// POST /api/wishlist — add item to wishlist (toggle)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  // Check if already in wishlist — toggle
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  }

  // Add to wishlist
  const item = await prisma.wishlistItem.create({
    data: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json({ action: "added", item }, { status: 201 });
}

// DELETE /api/wishlist — remove item from wishlist
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  });

  return NextResponse.json({ success: true });
}
