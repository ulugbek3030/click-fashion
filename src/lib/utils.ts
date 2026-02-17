import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from tiyins to readable UZS string
 * 1 sum = 100 tiyins
 */
export function formatPrice(tiyins: number): string {
  const sums = Math.round(tiyins / 100);
  return new Intl.NumberFormat("ru-RU").format(sums) + " сум";
}

export function formatPriceLocalized(
  tiyins: number,
  locale: string
): string {
  const sums = Math.round(tiyins / 100);
  const formatted = new Intl.NumberFormat("ru-RU").format(sums);

  switch (locale) {
    case "uz":
      return formatted + " so'm";
    case "en":
      return formatted + " UZS";
    default:
      return formatted + " сум";
  }
}

/**
 * Generate idempotency key for orders
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
