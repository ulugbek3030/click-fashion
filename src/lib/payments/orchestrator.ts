import type { PaymentProvider } from "./types";
import { ClickPayProvider } from "./providers/click";
import { AcquirerProvider } from "./providers/acquirer";

const providers: Record<string, PaymentProvider> = {
  CLICK: new ClickPayProvider(),
  CARD_ACQUIRING: new AcquirerProvider(),
};

export function getPaymentProvider(method: string): PaymentProvider | null {
  return providers[method] || null;
}

export function getAvailableMethods(): string[] {
  return Object.keys(providers);
}
