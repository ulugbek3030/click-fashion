"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, FolderTree, ChevronDown, ChevronRight } from "lucide-react";

interface CategoryTranslation {
  locale: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  parentId: string | null;
  gender: string | null;
  position: number;
  isActive: boolean;
  image: string | null;
  translations: CategoryTranslation[];
  parent?: { translations: { name: string }[] } | null;
  _count: { products: number; children: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    parentId: "",
    gender: "",
    position: 0,
    isActive: true,
    translations: [
      { locale: "ru", name: "", slug: "" },
      { locale: "uz", name: "", slug: "" },
      { locale: "en", name: "", slug: "" },
    ],
  });

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Load categories error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setFormData({
      parentId: "",
      gender: "",
      position: 0,
      isActive: true,
      translations: [
        { locale: "ru", name: "", slug: "" },
        { locale: "uz", name: "", slug: "" },
        { locale: "en", name: "", slug: "" },
      ],
    });
  };

  const startCreate = () => {
    resetForm();
    setEditingId(null);
    setIsCreating(true);
  };

  const startEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingId(cat.id);
    setFormData({
      parentId: cat.parentId || "",
      gender: cat.gender || "",
      position: cat.position,
      isActive: cat.isActive,
      translations: ["ru", "uz", "en"].map((locale) => {
        const t = cat.translations.find((t) => t.locale === locale);
        return { locale, name: t?.name || "", slug: t?.slug || "" };
      }),
    });
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      parentId: formData.parentId || null,
      gender: formData.gender || null,
      translations: formData.translations.filter((t) => t.name),
    };

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingId(null);
        setIsCreating(false);
        resetForm();
        loadCategories();
      }
    } catch (err) {
      console.error("Save category error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Cannot delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateTranslation = (index: number, field: string, value: string) => {
    const updated = [...formData.translations];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "name") {
      updated[index].slug = value
        .toLowerCase()
        .replace(/[^a-z0-9а-яёўғқҳ\s-]/gi, "")
        .replace(/\s+/g, "-");
    }
    setFormData({ ...formData, translations: updated });
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  // Organize into tree
  const rootCategories = categories.filter((c) => !c.parentId);
  const childrenMap = new Map<string, Category[]>();
  categories.forEach((c) => {
    if (c.parentId) {
      const children = childrenMap.get(c.parentId) || [];
      children.push(c);
      childrenMap.set(c.parentId, children);
    }
  });

  const renderCategory = (cat: Category, depth: number = 0) => {
    const name =
      cat.translations.find((t) => t.locale === "ru")?.name || cat.id;
    const children = childrenMap.get(cat.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(cat.id);

    return (
      <div key={cat.id}>
        <div
          className="flex items-center gap-2 border-b border-border px-2 py-2.5 hover:bg-neutral-50"
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpand(cat.id)} className="text-muted">
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <span className="w-3.5" />
          )}
          <FolderTree size={14} className="text-muted" />
          <span className="flex-1 text-sm font-medium">{name}</span>
          <span className="text-xs text-muted">
            {cat.gender || "all"} · {cat._count.products} products
          </span>
          <span
            className={`text-xs ${cat.isActive ? "text-green-600" : "text-muted"}`}
          >
            {cat.isActive ? "Active" : "Hidden"}
          </span>
          <button
            onClick={() => startEdit(cat)}
            className="p-1 text-muted hover:text-foreground"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDelete(cat.id)}
            className="p-1 text-muted hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
        {isExpanded &&
          children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Categories ({categories.length})
        </h1>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 border border-border p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
            {editingId ? "Edit Category" : "New Category"}
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Parent</label>
              <select
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              >
                <option value="">None (root)</option>
                {categories
                  .filter((c) => c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.translations.find((t) => t.locale === "ru")?.name ||
                        c.id}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="MEN">Men</option>
                <option value="WOMEN">Women</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Position</label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          {formData.translations.map((t, i) => (
            <div key={t.locale} className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Name ({t.locale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) =>
                    updateTranslation(i, "name", e.target.value)
                  }
                  className="w-full border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Slug ({t.locale.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={t.slug}
                  onChange={(e) =>
                    updateTranslation(i, "slug", e.target.value)
                  }
                  className="w-full border border-border px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <div className="flex-1" />
            <button
              onClick={() => {
                setEditingId(null);
                setIsCreating(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Category Tree */}
      <div className="border border-border">
        {rootCategories.map((cat) => renderCategory(cat))}
        {categories.length === 0 && (
          <div className="py-8 text-center text-muted">No categories yet</div>
        )}
      </div>
    </div>
  );
}
