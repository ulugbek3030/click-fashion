"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Upload, GripVertical, Eye, EyeOff } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string | null;
  titleUz: string | null;
  titleEn: string | null;
  subtitle: string | null;
  subtitleUz: string | null;
  subtitleEn: string | null;
  imageUrl: string;
  imageMobile: string | null;
  linkUrl: string | null;
  position: number;
  isActive: boolean;
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    titleUz: "",
    titleEn: "",
    subtitle: "",
    subtitleUz: "",
    subtitleEn: "",
    imageUrl: "",
    imageMobile: "",
    linkUrl: "",
    position: 0,
    isActive: true,
  });

  const loadSlides = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hero");
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const resetForm = () => {
    setForm({
      title: "",
      titleUz: "",
      titleEn: "",
      subtitle: "",
      subtitleUz: "",
      subtitleEn: "",
      imageUrl: "",
      imageMobile: "",
      linkUrl: "",
      position: slides.length,
      isActive: true,
    });
  };

  const startEdit = (s: HeroSlide) => {
    setIsCreating(false);
    setEditingId(s.id);
    setForm({
      title: s.title || "",
      titleUz: s.titleUz || "",
      titleEn: s.titleEn || "",
      subtitle: s.subtitle || "",
      subtitleUz: s.subtitleUz || "",
      subtitleEn: s.subtitleEn || "",
      imageUrl: s.imageUrl,
      imageMobile: s.imageMobile || "",
      linkUrl: s.linkUrl || "",
      position: s.position,
      isActive: s.isActive,
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "imageMobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, [field]: data.url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/admin/hero/${editingId}`
        : "/api/admin/hero";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEditingId(null);
        setIsCreating(false);
        resetForm();
        loadSlides();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
      loadSlides();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await fetch(`/api/admin/hero/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      loadSlides();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hero Slides ({slides.length})</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setIsCreating(true);
          }}
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background"
        >
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 border border-border p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
            {editingId ? "Edit Slide" : "New Slide"}
          </h2>

          {/* Images */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">
                Desktop Image
              </label>
              {form.imageUrl ? (
                <div className="relative mb-2">
                  <img
                    src={form.imageUrl}
                    alt="Desktop"
                    className="h-32 w-full object-cover border border-border"
                  />
                  <button
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute right-1 top-1 bg-red-600 px-1.5 py-0.5 text-xs text-white"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-3 py-2 text-sm text-muted hover:bg-neutral-50">
                <Upload size={14} /> Upload Desktop Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "imageUrl")}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
                placeholder="Or paste URL..."
                className="mt-1 w-full border border-border px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Mobile Image (optional)
              </label>
              {form.imageMobile ? (
                <div className="relative mb-2">
                  <img
                    src={form.imageMobile}
                    alt="Mobile"
                    className="h-32 w-full object-cover border border-border"
                  />
                  <button
                    onClick={() => setForm({ ...form, imageMobile: "" })}
                    className="absolute right-1 top-1 bg-red-600 px-1.5 py-0.5 text-xs text-white"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border px-3 py-2 text-sm text-muted hover:bg-neutral-50">
                <Upload size={14} /> Upload Mobile Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "imageMobile")}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={form.imageMobile}
                onChange={(e) =>
                  setForm({ ...form, imageMobile: e.target.value })
                }
                placeholder="Or paste URL..."
                className="mt-1 w-full border border-border px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Text fields */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs text-muted">
                Title (RU)
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Title (UZ)
              </label>
              <input
                type="text"
                value={form.titleUz}
                onChange={(e) =>
                  setForm({ ...form, titleUz: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Title (EN)
              </label>
              <input
                type="text"
                value={form.titleEn}
                onChange={(e) =>
                  setForm({ ...form, titleEn: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Subtitle (RU)
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) =>
                  setForm({ ...form, subtitle: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Subtitle (UZ)
              </label>
              <input
                type="text"
                value={form.subtitleUz}
                onChange={(e) =>
                  setForm({ ...form, subtitleUz: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Subtitle (EN)
              </label>
              <input
                type="text"
                value={form.subtitleEn}
                onChange={(e) =>
                  setForm({ ...form, subtitleEn: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">
                Link URL
              </label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) =>
                  setForm({ ...form, linkUrl: e.target.value })
                }
                placeholder="/catalog/women"
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Position
              </label>
              <input
                type="number"
                value={form.position}
                onChange={(e) =>
                  setForm({
                    ...form,
                    position: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditingId(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 text-sm text-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-foreground px-4 py-2 text-sm text-background"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Slides list */}
      <div className="space-y-2">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="flex items-center gap-4 border border-border px-4 py-3"
          >
            <GripVertical size={14} className="text-muted" />
            <img
              src={slide.imageUrl}
              alt={slide.title || "Slide"}
              className="h-16 w-28 object-cover border border-border"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{slide.title || "No title"}</p>
              {slide.subtitle && (
                <p className="text-xs text-muted">{slide.subtitle}</p>
              )}
              {slide.linkUrl && (
                <p className="text-xs text-blue-600">{slide.linkUrl}</p>
              )}
            </div>
            <span className="text-xs text-muted">Pos: {slide.position}</span>
            <button
              onClick={() => toggleActive(slide)}
              className={`text-xs ${slide.isActive ? "text-green-600" : "text-muted"}`}
            >
              {slide.isActive ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
            </button>
            <button
              onClick={() => startEdit(slide)}
              className="text-muted hover:text-foreground"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => handleDelete(slide.id)}
              className="text-muted hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="py-8 text-center text-muted">No slides yet</div>
        )}
      </div>
    </div>
  );
}
