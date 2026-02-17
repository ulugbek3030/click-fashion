import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ClickPayProvider } from "@/lib/payments/providers/click";

const clickProvider = new ClickPayProvider();

// POST /api/payments/click/webhook — handle Click callback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const result = await clickProvider.verifyWebhook({ headers, body });

    if (!result.orderId) {
      return NextResponse.json(
        { error: -1, error_note: "Missing order ID" },
        { status: 400 }
      );
    }

    // Idempotency: check if transaction already processed
    if (result.transactionId) {
      const existingPayment = await prisma.payment.findUnique({
        where: { externalTransactionId: result.transactionId },
      });
      if (existingPayment && existingPayment.status === "SUCCESS") {
        return NextResponse.json({ error: 0, error_note: "Already processed" });
      }
    }

    const order = await prisma.order.findUnique({
      where: { id: result.orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: -5, error_note: "Order not found" },
        { status: 404 }
      );
    }

    if (result.success) {
      // Success: update payment and order
      await prisma.$transaction(async (tx) => {
        // Update or create payment
        await tx.payment.updateMany({
          where: { orderId: order.id, method: "CLICK", status: "PENDING" },
          data: {
            status: "SUCCESS",
            externalTransactionId: result.transactionId,
            providerData: body as object,
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });

        // Decrease stock (only on successful payment)
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: order.id },
        });

        for (const item of orderItems) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      });

      return NextResponse.json({ error: 0, error_note: "Success" });
    } else {
      // Failed payment
      await prisma.payment.updateMany({
        where: { orderId: order.id, method: "CLICK", status: "PENDING" },
        data: {
          status: "FAILED",
          externalTransactionId: result.transactionId || undefined,
          errorMessage: result.error,
          providerData: body as object,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({
        error: -1,
        error_note: result.error || "Payment failed",
      });
    }
  } catch (error) {
    console.error("Click webhook error:", error);
    return NextResponse.json(
      { error: -1, error_note: "Internal server error" },
      { status: 500 }
    );
  }
}
