"use client";

import { useTranslations } from "next-intl";
import { User, Package, Heart } from "lucide-react";

interface AccountProfileProps {
  user: {
    name: string;
    email: string;
    phone: string;
    memberSince: string;
    ordersCount: number;
    wishlistCount: number;
  };
}

export default function AccountProfile({ user }: AccountProfileProps) {
  const t = useTranslations("account");

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="border border-border p-4 text-center">
          <Package size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-2xl font-bold">{user.ordersCount}</p>
          <p className="text-xs text-muted">{t("orders")}</p>
        </div>
        <div className="border border-border p-4 text-center">
          <Heart size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-2xl font-bold">{user.wishlistCount}</p>
          <p className="text-xs text-muted">
            {t("title") === "Аккаунт" ? "Избранное" : "Wishlist"}
          </p>
        </div>
        <div className="border border-border p-4 text-center">
          <User size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-sm font-medium">
            {new Date(user.memberSince).toLocaleDateString("ru-RU", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-muted">
            {t("title") === "Аккаунт" ? "Дата регистрации" : "Member since"}
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="border border-border p-6">
        <h2 className="mb-6 text-xl font-semibold">{t("personalInfo")}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">
              {t("name")}
            </label>
            <p className="mt-1 text-sm">{user.name || "—"}</p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">
              {t("email")}
            </label>
            <p className="mt-1 text-sm">{user.email || "—"}</p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted">
              {t("phone")}
            </label>
            <p className="mt-1 text-sm">{user.phone || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
