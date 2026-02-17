import type { Locale } from "@/i18n/routing";

export type { Locale };

export interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface ProductWithDetails {
  id: string;
  sku: string;
  gender: string;
  lineType: string;
  allowPromo: boolean;
  basePrice: number;
  salePrice: number | null;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  releaseAt: Date | null;
  categoryId: string;
  translations: {
    locale: string;
    name: string;
    slug: string;
    description: string | null;
    craftDetails: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
  }[];
  images: {
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }[];
  variants: {
    id: string;
    sku: string;
    stock: number;
    color: { id: string; name: string; nameUz: string | null; nameEn: string | null; hexCode: string };
    size: { id: string; name: string };
  }[];
  category: {
    id: string;
    translations: {
      locale: string;
      name: string;
      slug: string;
    }[];
  };
}

export interface CartItemType {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: {
    basePrice: number;
    salePrice: number | null;
    translations: { locale: string; name: string; slug: string }[];
    images: { url: string; alt: string | null }[];
  };
  variant: {
    sku: string;
    color: { name: string; hexCode: string };
    size: { name: string };
  };
}
