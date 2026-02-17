import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Tag, Gift, MapPin, Image } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user?.id ||
    !["ADMIN", "SUPER_ADMIN"].includes(
      (session.user as { role?: string }).role || ""
    )
  ) {
    redirect(`/${locale}/login`);
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/promo", label: "Promo Codes", icon: Tag },
    { href: "/admin/gifts", label: "Gift Certificates", icon: Gift },
    { href: "/admin/pickup-points", label: "Pickup Points", icon: MapPin },
    { href: "/admin/hero", label: "Hero Slides", icon: Image },
  ];

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card">
        <div className="p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Admin Panel
          </h2>
        </div>
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-muted hover:bg-neutral-100 hover:text-foreground transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
