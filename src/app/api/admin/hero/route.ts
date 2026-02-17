import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/hero — list all hero slides
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await prisma.heroSlide.findMany({
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ slides });
}

// POST /api/admin/hero — create a hero slide
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    titleUz,
    titleEn,
    subtitle,
    subtitleUz,
    subtitleEn,
    imageUrl,
    imageMobile,
    linkUrl,
    position,
    isActive,
  } = body;

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Image URL is required" },
      { status: 400 }
    );
  }

  try {
    const slide = await prisma.heroSlide.create({
      data: {
        title: title || null,
        titleUz: titleUz || null,
        titleEn: titleEn || null,
        subtitle: subtitle || null,
        subtitleUz: subtitleUz || null,
        subtitleEn: subtitleEn || null,
        imageUrl,
        imageMobile: imageMobile || null,
        linkUrl: linkUrl || null,
        position: position || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("Create hero slide error:", error);
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
