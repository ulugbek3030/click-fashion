import type { PaymentProvider, PaymentInitResult, PaymentVerifyResult } from "../types";

const MERCHANT_ID = process.env.ACQUIRER_MERCHANT_ID || "";
const SECRET_KEY = process.env.ACQUIRER_SECRET_KEY || "";

/**
 * Card Acquiring payment provider stub.
 * To be implemented when the acquiring bank provides the API specification.
 */
export class AcquirerProvider implements PaymentProvider {
  name = "acquirer";

  async init(params: {
    orderId: string;
    amount: number;
    returnUrl: string;
  }): Promise<PaymentInitResult> {
    if (!MERCHANT_ID || !SECRET_KEY) {
      return { status: "error", error: "Card Acquiring not configured" };
    }

    // TODO: Implement when acquiring bank provides API docs
    // This should:
    // 1. Create a payment session with the bank
    // 2. Return a redirect URL to the bank's payment page
    // 3. The bank will redirect back to returnUrl after payment

    return {
      status: "error",
      error: "Card Acquiring is not yet implemented. Please use Click Pay.",
    };
  }

  async verifyWebhook(params: {
    headers: Record<string, string>;
    body: Record<string, unknown>;
  }): Promise<PaymentVerifyResult> {
    // TODO: Implement signature verification and payment confirmation
    // when acquiring bank provides webhook specification

    return {
      success: false,
      transactionId: "",
      amount: 0,
      orderId: "",
      error: "Card Acquiring webhook not implemented",
    };
  }
}
