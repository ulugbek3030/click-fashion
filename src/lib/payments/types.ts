export interface PaymentInitResult {
  redirectUrl?: string;
  transactionId?: string;
  status: "redirect" | "pending" | "error";
  error?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  transactionId: string;
  amount: number;
  orderId: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  init(params: {
    orderId: string;
    amount: number;
    returnUrl: string;
  }): Promise<PaymentInitResult>;

  verifyWebhook(params: {
    headers: Record<string, string>;
    body: Record<string, unknown>;
  }): Promise<PaymentVerifyResult>;
}
