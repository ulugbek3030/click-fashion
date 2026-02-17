import crypto from "crypto";
import type { PaymentProvider, PaymentInitResult, PaymentVerifyResult } from "../types";

const MERCHANT_ID = process.env.CLICK_MERCHANT_ID || "";
const SERVICE_ID = process.env.CLICK_SERVICE_ID || "";
const SECRET_KEY = process.env.CLICK_SECRET_KEY || "";

export class ClickPayProvider implements PaymentProvider {
  name = "click";

  async init(params: {
    orderId: string;
    amount: number;
    returnUrl: string;
  }): Promise<PaymentInitResult> {
    if (!MERCHANT_ID || !SERVICE_ID) {
      return { status: "error", error: "Click Pay not configured" };
    }

    // Amount in tiyins → convert to sums for Click
    const amountInSums = Math.round(params.amount / 100);

    // Click redirect URL
    const url = new URL("https://my.click.uz/services/pay");
    url.searchParams.set("service_id", SERVICE_ID);
    url.searchParams.set("merchant_id", MERCHANT_ID);
    url.searchParams.set("amount", amountInSums.toString());
    url.searchParams.set("transaction_param", params.orderId);
    url.searchParams.set("return_url", params.returnUrl);

    return {
      status: "redirect",
      redirectUrl: url.toString(),
    };
  }

  async verifyWebhook(params: {
    headers: Record<string, string>;
    body: Record<string, unknown>;
  }): Promise<PaymentVerifyResult> {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      amount,
      action,
      error,
      sign_time,
      sign_string,
    } = params.body as Record<string, string>;

    // Verify signature
    const expectedSign = crypto
      .createHash("md5")
      .update(
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
      )
      .digest("hex");

    if (sign_string !== expectedSign) {
      return {
        success: false,
        transactionId: click_trans_id || "",
        amount: 0,
        orderId: merchant_trans_id || "",
        error: "Invalid signature",
      };
    }

    // Error check
    if (error && error !== "0") {
      return {
        success: false,
        transactionId: click_trans_id,
        amount: parseFloat(amount) * 100, // convert sums back to tiyins
        orderId: merchant_trans_id,
        error: `Click error: ${error}`,
      };
    }

    return {
      success: true,
      transactionId: click_trans_id,
      amount: parseFloat(amount) * 100,
      orderId: merchant_trans_id,
    };
  }
}
