import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/cart — get cart items for authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          translations: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
      variant: {
        include: { color: true, size: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = cartItems.map((ci) => ({
    id: ci.id,
    productId: ci.productId,
    variantId: ci.variantId,
    quantity: ci.quantity,
    name: ci.product.translations[0]?.name || ci.product.sku,
    slug: ci.product.translations[0]?.slug || ci.product.sku,
    price: ci.product.basePrice,
    salePrice: ci.product.salePrice,
    image: ci.product.images[0]?.url || "",
    color: ci.variant.color.name,
    colorHex: ci.variant.color.hexCode,
    size: ci.variant.size.name,
    variantSku: ci.variant.sku,
    stock: ci.variant.stock,
  }));

  return NextResponse.json({ items });
}

// POST /api/cart — add item to cart
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { variantId, quantity = 1 } = await req.json();

  if (!variantId) {
    return NextResponse.json(
      { error: "variantId is required" },
      { status: 400 }
    );
  }

  // Check variant exists and has stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) {
    return NextResponse.json(
      { error: "Variant not found" },
      { status: 404 }
    );
  }

  if (variant.stock < quantity) {
    return NextResponse.json(
      { error: "Insufficient stock" },
      { status: 400 }
    );
  }

  // Upsert cart item
  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_variantId: {
        userId: session.user.id,
        variantId,
      },
    },
    create: {
      userId: session.user.id,
      productId: variant.productId,
      variantId,
      quantity,
    },
    update: {
      quantity: { increment: quantity },
    },
  });

  return NextResponse.json({ cartItem }, { status: 201 });
}

// PUT /api/cart — update cart item quantity
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { variantId, quantity } = await req.json();

  if (!variantId || quantity === undefined) {
    return NextResponse.json(
      { error: "variantId and quantity are required" },
      { status: 400 }
    );
  }

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id, variantId },
    });
    return NextResponse.json({ success: true });
  }

  // Check stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant || variant.stock < quantity) {
    return NextResponse.json(
      { error: "Insufficient stock" },
      { status: 400 }
    );
  }

  await prisma.cartItem.updateMany({
    where: { userId: session.user.id, variantId },
    data: { quantity },
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/cart — remove item from cart
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { variantId } = await req.json();

  if (!variantId) {
    return NextResponse.json(
      { error: "variantId is required" },
      { status: 400 }
    );
  }

  await prisma.cartItem.deleteMany({
    where: { userId: session.user.id, variantId },
  });

  return NextResponse.json({ success: true });
}
