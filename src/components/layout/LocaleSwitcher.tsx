"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const localeLabels: Record<Locale, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
};

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function onChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-1.5 py-0.5 text-xs font-medium transition-colors ${
            l === locale
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
