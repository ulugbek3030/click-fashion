"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Trash2, Upload } from "lucide-react";

interface Translation {
  locale: string;
  name: string;
  slug: string;
  description: string;
  craftDetails: string;
  metaTitle: string;
  metaDescription: string;
}

interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  position: number;
}

interface Variant {
  id?: string;
  colorId: string;
  sizeId: string;
  stock: number;
  sku: string;
}

interface Category {
  id: string;
  translations: { locale: string; name: string }[];
}

interface Color {
  id: string;
  name: string;
  hexCode: string;
}

interface Size {
  id: string;
  name: string;
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const id = isNew ? null : (params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [sku, setSku] = useState("");
  const [gender, setGender] = useState("WOMEN");
  const [lineType, setLineType] = useState("MAIN");
  const [allowPromo, setAllowPromo] = useState(true);
  const [basePrice, setBasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [translations, setTranslations] = useState<Translation[]>([
    { locale: "ru", name: "", slug: "", description: "", craftDetails: "", metaTitle: "", metaDescription: "" },
    { locale: "uz", name: "", slug: "", description: "", craftDetails: "", metaTitle: "", metaDescription: "" },
    { locale: "en", name: "", slug: "", description: "", craftDetails: "", metaTitle: "", metaDescription: "" },
  ]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, attrRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/attributes"),
        ]);
        const catData = await catRes.json();
        const attrData = await attrRes.json();
        setCategories(catData.categories || []);
        setColors(attrData.colors || []);
        setSizes(attrData.sizes || []);

        if (!isNew && id) {
          const res = await fetch(`/api/admin/products/${id}`);
          const data = await res.json();
          if (data.product) {
            const p = data.product;
            setSku(p.sku);
            setGender(p.gender);
            setLineType(p.lineType);
            setAllowPromo(p.allowPromo);
            setBasePrice(p.basePrice);
            setSalePrice(p.salePrice || 0);
            setIsNewProduct(p.isNew);
            setIsFeatured(p.isFeatured);
            setIsActive(p.isActive);
            setCategoryId(p.categoryId);

            // Merge translations
            const merged = ["ru", "uz", "en"].map((locale) => {
              const existing = p.translations.find(
                (t: Translation) => t.locale === locale
              );
              return (
                existing || {
                  locale,
                  name: "",
                  slug: "",
                  description: "",
                  craftDetails: "",
                  metaTitle: "",
                  metaDescription: "",
                }
              );
            });
            setTranslations(merged);
            setImages(
              p.images.map((img: ProductImage) => ({
                url: img.url,
                alt: img.alt || "",
                position: img.position,
              }))
            );
            setVariants(
              p.variants.map(
                (v: { colorId: string; sizeId: string; stock: number; sku: string }) => ({
                  colorId: v.colorId,
                  sizeId: v.sizeId,
                  stock: v.stock,
                  sku: v.sku,
                })
              )
            );
          }
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isNew]);

  const handleTranslationChange = (
    index: number,
    field: keyof Translation,
    value: string
  ) => {
    const updated = [...translations];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-generate slug from name
    if (field === "name") {
      updated[index].slug = value
        .toLowerCase()
        .replace(/[^a-z0-9а-яёўғқҳ\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
    setTranslations(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [
            ...prev,
            { url: data.url, alt: "", position: prev.length },
          ]);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { colorId: colors[0]?.id || "", sizeId: sizes[0]?.id || "", stock: 0, sku: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const payload = {
      sku,
      gender,
      lineType,
      allowPromo,
      basePrice,
      salePrice: salePrice || null,
      isNew: isNewProduct,
      isFeatured,
      isActive,
      categoryId,
      translations: translations.filter((t) => t.name),
      images,
      variants,
    };

    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      const data = await res.json();
      if (isNew && data.product?.id) {
        router.push(`/${params.locale}/admin/products/${data.product.id}`);
      }
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      router.push(`/${params.locale}/admin/products`);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return <div className="p-4 text-muted">Loading...</div>;
  }

  const localeLabels: Record<string, string> = {
    ru: "Русский",
    uz: "O'zbek",
    en: "English",
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${params.locale}/admin/products`)}
            className="text-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">
            {isNew ? "New Product" : "Edit Product"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90 disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="mb-8 border border-border p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
          Basic Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-muted">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.translations.find((t) => t.locale === "ru")?.name ||
                    cat.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm"
            >
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Line Type</label>
            <select
              value={lineType}
              onChange={(e) => setLineType(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm"
            >
              <option value="MAIN">Main</option>
              <option value="MERCH">Merch</option>
              <option value="COLLAB">Collab</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Base Price (tiyins)
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)}
              className="w-full border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Sale Price (tiyins, 0 = none)
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(parseInt(e.target.value) || 0)}
              className="w-full border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />{" "}
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isNewProduct}
              onChange={(e) => setIsNewProduct(e.target.checked)}
            />{" "}
            New
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />{" "}
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowPromo}
              onChange={(e) => setAllowPromo(e.target.checked)}
            />{" "}
            Allow Promo
          </label>
        </div>
      </section>

      {/* Translations */}
      <section className="mb-8 border border-border p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
          Translations
        </h2>
        {translations.map((t, i) => (
          <div key={t.locale} className="mb-6 last:mb-0">
            <h3 className="mb-2 text-sm font-semibold">
              {localeLabels[t.locale]}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted">Name</label>
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) =>
                    handleTranslationChange(i, "name", e.target.value)
                  }
                  className="w-full border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Slug</label>
                <input
                  type="text"
                  value={t.slug}
                  onChange={(e) =>
                    handleTranslationChange(i, "slug", e.target.value)
                  }
                  className="w-full border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs text-muted">
                Description
              </label>
              <textarea
                value={t.description}
                onChange={(e) =>
                  handleTranslationChange(i, "description", e.target.value)
                }
                rows={3}
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs text-muted">
                Craft Details
              </label>
              <textarea
                value={t.craftDetails}
                onChange={(e) =>
                  handleTranslationChange(i, "craftDetails", e.target.value)
                }
                rows={2}
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </section>

      {/* Images */}
      <section className="mb-8 border border-border p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
          Images
        </h2>
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img
                src={img.url}
                alt={img.alt}
                className="h-24 w-24 object-cover border border-border"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-red-600 text-xs text-white rounded-full"
              >
                x
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-border text-muted hover:bg-neutral-50">
            <Upload size={20} />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* Variants */}
      <section className="mb-8 border border-border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Variants
          </h2>
          <button
            onClick={addVariant}
            className="text-sm text-foreground hover:underline"
          >
            + Add Variant
          </button>
        </div>
        {variants.length === 0 && (
          <p className="text-sm text-muted">No variants added</p>
        )}
        {variants.map((v, i) => (
          <div
            key={i}
            className="mb-3 flex items-end gap-3 border-b border-border pb-3 last:border-0"
          >
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted">Color</label>
              <select
                value={v.colorId}
                onChange={(e) => updateVariant(i, "colorId", e.target.value)}
                className="w-full border border-border px-2 py-1.5 text-sm"
              >
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted">Size</label>
              <select
                value={v.sizeId}
                onChange={(e) => updateVariant(i, "sizeId", e.target.value)}
                className="w-full border border-border px-2 py-1.5 text-sm"
              >
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs text-muted">Stock</label>
              <input
                type="number"
                value={v.stock}
                onChange={(e) =>
                  updateVariant(i, "stock", parseInt(e.target.value) || 0)
                }
                className="w-full border border-border px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted">
                Variant SKU
              </label>
              <input
                type="text"
                value={v.sku}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                className="w-full border border-border px-2 py-1.5 text-sm"
              />
            </div>
            <button
              onClick={() => removeVariant(i)}
              className="pb-1 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
