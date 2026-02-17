"use client";

import { useTranslations } from "next-intl";
import { Drawer } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { User, Heart, ShoppingBag, Search } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations("nav");

  const menuLinks = [
    { href: "/catalog/women", label: t("women") },
    { href: "/catalog/men", label: t("men") },
    { href: "/catalog/women?sort=newest", label: t("new") },
  ];

  const accountLinks = [
    { href: "/account", label: t("account"), icon: User },
    { href: "/wishlist", label: t("wishlist"), icon: Heart },
    { href: "/cart", label: t("cart"), icon: ShoppingBag },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="CLICK FASHION" side="left">
      {/* Search */}
      <div className="mb-6">
        <Link
          href="/catalog/women"
          onClick={onClose}
          className="flex items-center gap-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <Search size={18} />
          {t("home")}
        </Link>
      </div>

      {/* Main nav */}
      <nav className="mb-8 space-y-1">
        {menuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block py-3 text-lg font-medium uppercase tracking-wider hover:text-muted transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-border my-4" />

      {/* Account links */}
      <nav className="space-y-1">
        {accountLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center gap-3 py-2 text-sm hover:text-muted transition-colors"
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </nav>
    </Drawer>
  );
}
