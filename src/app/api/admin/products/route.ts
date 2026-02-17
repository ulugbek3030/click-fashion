import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/products — list products with pagination
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const gender = searchParams.get("gender") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.translations = {
      some: {
        name: { contains: search, mode: "insensitive" },
      },
    };
  }
  if (gender) {
    where.gender = gender;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        translations: { where: { locale: "ru" } },
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { include: { translations: { where: { locale: "ru" } } } },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    pages: Math.ceil(total / limit),
  });
}

// POST /api/admin/products — create a product
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    translations, // [{ locale, name, slug, description, craftDetails, metaTitle, metaDescription }]
    images, // [{ url, alt, position }]
    variants, // [{ colorId, sizeId, stock, sku }]
  } = body;

  if (!sku || !gender || !categoryId || !basePrice || !translations?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        sku,
        gender,
        lineType: lineType || "MAIN",
        allowPromo: allowPromo !== false,
        basePrice,
        salePrice: salePrice || null,
        isNew: isNew || false,
        isFeatured: isFeatured || false,
        isActive: isActive !== false,
        releaseAt: releaseAt ? new Date(releaseAt) : null,
        categoryId,
        translations: {
          create: translations.map(
            (t: {
              locale: string;
              name: string;
              slug: string;
              description?: string;
              craftDetails?: string;
              metaTitle?: string;
              metaDescription?: string;
            }) => ({
              locale: t.locale,
              name: t.name,
              slug: t.slug,
              description: t.description || null,
              craftDetails: t.craftDetails || null,
              metaTitle: t.metaTitle || null,
              metaDescription: t.metaDescription || null,
            })
          ),
        },
        images: images?.length
          ? {
              create: images.map(
                (img: { url: string; alt?: string; position?: number }) => ({
                  url: img.url,
                  alt: img.alt || null,
                  position: img.position || 0,
                })
              ),
            }
          : undefined,
        variants: variants?.length
          ? {
              create: variants.map(
                (v: {
                  colorId: string;
                  sizeId: string;
                  stock: number;
                  sku: string;
                }) => ({
                  colorId: v.colorId,
                  sizeId: v.sizeId,
                  stock: v.stock || 0,
                  sku: v.sku,
                })
              ),
            }
          : undefined,
      },
      include: {
        translations: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
