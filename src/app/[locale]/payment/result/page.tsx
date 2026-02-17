import { Link } from "@/i18n/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface PaymentResultPageProps {
  searchParams: Promise<{ orderId?: string; status?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function PaymentResultPage({
  searchParams,
  params,
}: PaymentResultPageProps) {
  const { status, orderId } = await searchParams;
  const { locale } = await params;

  const isSuccess = status === "success" || status === "created";
  const isFailed = status === "failed";
  const isPending = !isSuccess && !isFailed;

  const labels = {
    ru: {
      success: "Заказ успешно создан!",
      successSub: "Ваш заказ принят и будет обработан в ближайшее время.",
      failed: "Ошибка оплаты",
      failedSub: "Не удалось обработать платёж. Пожалуйста, попробуйте ещё раз.",
      pending: "Обработка платежа...",
      pendingSub: "Ваш платёж обрабатывается. Это может занять несколько минут.",
      orderId: "Номер заказа",
      toOrders: "Мои заказы",
      toCatalog: "Продолжить покупки",
      retry: "Попробовать снова",
    },
    uz: {
      success: "Buyurtma muvaffaqiyatli yaratildi!",
      successSub: "Sizning buyurtmangiz qabul qilindi va tez orada ko'rib chiqiladi.",
      failed: "To'lov xatosi",
      failedSub: "To'lovni amalga oshirib bo'lmadi. Iltimos, qayta urinib ko'ring.",
      pending: "To'lov amalga oshirilmoqda...",
      pendingSub: "Sizning to'lovingiz amalga oshirilmoqda. Bu bir necha daqiqa vaqt olishi mumkin.",
      orderId: "Buyurtma raqami",
      toOrders: "Mening buyurtmalarim",
      toCatalog: "Xaridni davom ettirish",
      retry: "Qayta urinish",
    },
    en: {
      success: "Order successfully created!",
      successSub: "Your order has been received and will be processed shortly.",
      failed: "Payment failed",
      failedSub: "We couldn't process your payment. Please try again.",
      pending: "Processing payment...",
      pendingSub: "Your payment is being processed. This may take a few minutes.",
      orderId: "Order number",
      toOrders: "My Orders",
      toCatalog: "Continue Shopping",
      retry: "Try again",
    },
  };

  const l = labels[locale as keyof typeof labels] || labels.ru;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {isSuccess && (
        <>
          <CheckCircle size={64} className="mx-auto mb-4 text-success" />
          <h1 className="mb-2 text-2xl font-bold">{l.success}</h1>
          <p className="mb-2 text-muted">{l.successSub}</p>
          {orderId && (
            <p className="mb-6 text-sm text-muted">
              {l.orderId}: <span className="font-mono font-medium text-foreground">{orderId.slice(-8).toUpperCase()}</span>
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              {l.toOrders}
            </Link>
            <Link
              href="/catalog/women"
              className="inline-flex items-center justify-center border border-border px-6 py-3 text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              {l.toCatalog}
            </Link>
          </div>
        </>
      )}

      {isFailed && (
        <>
          <XCircle size={64} className="mx-auto mb-4 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">{l.failed}</h1>
          <p className="mb-6 text-muted">{l.failedSub}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              {l.retry}
            </Link>
            <Link
              href="/catalog/women"
              className="inline-flex items-center justify-center border border-border px-6 py-3 text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              {l.toCatalog}
            </Link>
          </div>
        </>
      )}

      {isPending && (
        <>
          <Clock size={64} className="mx-auto mb-4 text-warning animate-pulse" />
          <h1 className="mb-2 text-2xl font-bold">{l.pending}</h1>
          <p className="mb-6 text-muted">{l.pendingSub}</p>
        </>
      )}
    </div>
  );
}
