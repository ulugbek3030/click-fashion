import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import AccountNav from "@/components/account/AccountNav";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
}

const statusLabels: Record<string, Record<string, string>> = {
  CREATED: { ru: "Создан", uz: "Yaratilgan", en: "Created" },
  PAYMENT_PENDING: { ru: "Ожидает оплаты", uz: "To'lov kutilmoqda", en: "Payment pending" },
  PAID: { ru: "Оплачен", uz: "To'langan", en: "Paid" },
  FAILED: { ru: "Ошибка", uz: "Xatolik", en: "Failed" },
  CANCELED: { ru: "Отменён", uz: "Bekor qilingan", en: "Canceled" },
  FULFILLING: { ru: "Комплектуется", uz: "Tayyorlanmoqda", en: "Fulfilling" },
  SHIPPED: { ru: "Отправлен", uz: "Jo'natilgan", en: "Shipped" },
  COMPLETED: { ru: "Завершён", uz: "Tugallangan", en: "Completed" },
  REFUNDED: { ru: "Возврат", uz: "Qaytarilgan", en: "Refunded" },
};

const statusColors: Record<string, string> = {
  CREATED: "bg-neutral-200 text-neutral-700",
  PAYMENT_PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELED: "bg-neutral-200 text-neutral-500",
  FULFILLING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  REFUNDED: "bg-orange-100 text-orange-800",
};

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const t = await getTranslations("account");
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
    return null;
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              translations: { where: { locale } },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
          variant: {
            include: { color: true, size: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        <nav className="lg:col-span-1">
          <AccountNav locale={locale} active="orders" />
        </nav>

        <div className="lg:col-span-3">
          <h2 className="mb-6 text-xl font-semibold">{t("orders")}</h2>

          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-muted" />
              <p className="mb-6 text-muted">{t("noOrders")}</p>
              <Link
                href="/catalog/women"
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
              >
                {locale === "ru"
                  ? "Перейти в каталог"
                  : locale === "uz"
                    ? "Katalogga o'tish"
                    : "Browse catalog"}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-border p-4 sm:p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <p className="text-xs text-muted">
                        {locale === "ru" ? "Заказ" : locale === "uz" ? "Buyurtma" : "Order"} #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date(order.createdAt).toLocaleDateString(
                          locale === "uz" ? "uz-UZ" : locale === "en" ? "en-US" : "ru-RU",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || "bg-neutral-200"}`}
                      >
                        {statusLabels[order.status]?.[locale] || order.status}
                      </span>
                      <span className="text-sm font-semibold">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => {
                      const tr = item.product.translations[0];
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden bg-neutral-100">
                            {item.product.images[0]?.url && (
                              <img
                                src={item.product.images[0].url}
                                alt={tr?.name || ""}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {tr?.name || item.product.sku}
                            </p>
                            <p className="text-xs text-muted">
                              {item.variant.color.name} / {item.variant.size.name} &times; {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
