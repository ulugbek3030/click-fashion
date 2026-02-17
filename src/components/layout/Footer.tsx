import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-lg font-bold tracking-tight">
              CLICK FASHION
            </h3>
            <p className="text-sm text-muted">
              Fashion e-commerce for Uzbekistan
            </p>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("help")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t("delivery")}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t("contacts")}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("about")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("contacts")}
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Tashkent, Uzbekistan</li>
              <li>+998 71 123 45 67</li>
              <li>info@clickfashion.uz</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
          {t("copyright", { year: String(year) })}
        </div>
      </div>
    </footer>
  );
}
