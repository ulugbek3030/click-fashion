import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Valid status transitions
const validTransitions: Record<string, string[]> = {
  CREATED: ["CANCELED"],
  PAYMENT_PENDING: ["CANCELED"],
  PAID: ["FULFILLING", "CANCELED"],
  FULFILLING: ["SHIPPED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: ["REFUNDED"],
  FAILED: [],
  CANCELED: [],
  REFUNDED: [],
};

// PUT /api/admin/orders/[id] — update order status
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
  const { status } = body;

  if (!status) {
    return NextResponse.json(
      { error: "Status is required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      {
        error: `Cannot transition from ${order.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`,
      },
      { status: 400 }
    );
  }

  try {
    // If canceling, restore stock
    if (
      status === "CANCELED" &&
      ["PAID", "FULFILLING"].includes(order.status)
    ) {
      const items = await prisma.orderItem.findMany({
        where: { orderId: id },
      });

      for (const item of items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as never },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { include: { translations: { where: { locale: "ru" } } } },
            variant: { include: { color: true, size: true } },
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
