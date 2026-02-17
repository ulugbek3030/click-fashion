import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AccountProfile from "./AccountProfile";
import AccountNav from "@/components/account/AccountNav";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const t = await getTranslations("account");
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: { orders: true, wishlistItems: true },
      },
    },
  });

  if (!user) {
    redirect(`/${locale}/login`);
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        <nav className="lg:col-span-1">
          <AccountNav locale={locale} active="profile" />
        </nav>

        <div className="lg:col-span-3">
          <AccountProfile
            user={{
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              memberSince: user.createdAt.toISOString(),
              ordersCount: user._count.orders,
              wishlistCount: user._count.wishlistItems,
            }}
          />
        </div>
      </div>
    </div>
  );
}
