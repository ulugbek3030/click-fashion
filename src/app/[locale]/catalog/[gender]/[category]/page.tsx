import { getTranslations } from "next-intl/server";

interface CategoryPageProps {
  params: Promise<{ locale: string; gender: string; category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const t = await getTranslations("catalog");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight capitalize">
        {category.replace(/-/g, " ")}
      </h1>
      <p className="text-muted">{t("noProducts")}</p>
    </div>
  );
}
