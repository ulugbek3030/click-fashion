import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClickPayProvider } from "@/lib/payments/providers/click";

const clickProvider = new ClickPayProvider();

// POST /api/payments/click/init — initiate Click payment
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId is required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  if (order.status !== "CREATED") {
    return NextResponse.json(
      { error: "Order is not in a payable state" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${appUrl}/ru/payment/result?orderId=${orderId}`;

  const result = await clickProvider.init({
    orderId,
    amount: order.total,
    returnUrl,
  });

  if (result.status === "error") {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      orderId,
      method: "CLICK",
      status: "PENDING",
      amount: order.total,
    },
  });

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAYMENT_PENDING" },
  });

  return NextResponse.json({
    redirectUrl: result.redirectUrl,
  });
}
