import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AcquirerProvider } from "@/lib/payments/providers/acquirer";

const acquirerProvider = new AcquirerProvider();

// POST /api/payments/acquirer/init — initiate card acquiring payment
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${appUrl}/ru/payment/result?orderId=${orderId}`;

  const result = await acquirerProvider.init({
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

  return NextResponse.json({
    redirectUrl: result.redirectUrl,
  });
}
