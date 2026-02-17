import { Link } from "@/i18n/navigation";

interface AccountNavProps {
  locale: string;
  active: "profile" | "orders";
}

const labels = {
  ru: { profile: "Профиль", orders: "Заказы", logout: "Выйти" },
  uz: { profile: "Profil", orders: "Buyurtmalar", logout: "Chiqish" },
  en: { profile: "Profile", orders: "Orders", logout: "Logout" },
};

export default function AccountNav({ locale, active }: AccountNavProps) {
  const l = labels[locale as keyof typeof labels] || labels.ru;

  return (
    <div className="space-y-1">
      <Link
        href="/account"
        className={`block border-l-2 py-2 pl-4 text-sm transition-colors ${
          active === "profile"
            ? "border-foreground font-medium"
            : "border-transparent text-muted hover:text-foreground"
        }`}
      >
        {l.profile}
      </Link>
      <Link
        href="/account/orders"
        className={`block border-l-2 py-2 pl-4 text-sm transition-colors ${
          active === "orders"
            ? "border-foreground font-medium"
            : "border-transparent text-muted hover:text-foreground"
        }`}
      >
        {l.orders}
      </Link>
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="block w-full border-l-2 border-transparent py-2 pl-4 text-left text-sm text-muted hover:text-destructive transition-colors"
        >
          {l.logout}
        </button>
      </form>
    </div>
  );
}
