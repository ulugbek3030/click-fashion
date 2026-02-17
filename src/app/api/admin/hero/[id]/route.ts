import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/admin/hero/[id] — update hero slide
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

  try {
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title || null }),
        ...(body.titleUz !== undefined && { titleUz: body.titleUz || null }),
        ...(body.titleEn !== undefined && { titleEn: body.titleEn || null }),
        ...(body.subtitle !== undefined && {
          subtitle: body.subtitle || null,
        }),
        ...(body.subtitleUz !== undefined && {
          subtitleUz: body.subtitleUz || null,
        }),
        ...(body.subtitleEn !== undefined && {
          subtitleEn: body.subtitleEn || null,
        }),
        ...(body.imageUrl && { imageUrl: body.imageUrl }),
        ...(body.imageMobile !== undefined && {
          imageMobile: body.imageMobile || null,
        }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl || null }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Update hero slide error:", error);
    return NextResponse.json(
      { error: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hero/[id] — delete hero slide
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
    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete hero slide error:", error);
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
