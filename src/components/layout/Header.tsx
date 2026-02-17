"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import LocaleSwitcher from "./LocaleSwitcher";
import MobileMenu from "./MobileMenu";
import MiniCart from "../cart/MiniCart";

export default function Header() {
  const t = useTranslations("nav");
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        {/* Top bar */}
        <div className="border-b border-border">
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs text-muted">
            <span>Click Fashion — Uzbekistan</span>
            <LocaleSwitcher />
          </div>
        </div>

        {/* Main header */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Mobile menu button */}
          <button
            className="mr-4 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            CLICK FASHION
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-8 lg:ml-12">
            <Link
              href="/catalog/women"
              className="text-sm font-medium uppercase tracking-wider hover:text-muted transition-colors"
            >
              {t("women")}
            </Link>
            <Link
              href="/catalog/men"
              className="text-sm font-medium uppercase tracking-wider hover:text-muted transition-colors"
            >
              {t("men")}
            </Link>
            <Link
              href="/catalog/women?sort=newest"
              className="text-sm font-medium uppercase tracking-wider hover:text-muted transition-colors"
            >
              {t("new")}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/catalog/women"
              className="hidden sm:flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
              aria-label={t("home")}
            >
              <Search size={20} />
            </Link>
            <Link
              href="/account"
              className="hidden sm:flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
              aria-label={t("account")}
            >
              <User size={20} />
            </Link>
            <Link
              href="/wishlist"
              className="hidden sm:flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
              aria-label={t("wishlist")}
            >
              <Heart size={20} />
            </Link>
            <button
              onClick={openCart}
              className="relative flex items-center justify-center p-2 hover:opacity-70 transition-opacity"
              aria-label={t("cart")}
            >
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-foreground text-[10px] font-medium text-background">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Mini cart drawer */}
      <MiniCart />
    </>
  );
}
