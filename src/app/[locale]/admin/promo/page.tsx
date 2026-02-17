"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderTotal: number | null;
  maxDiscount: number | null;
  maxUsages: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  _count: { orders: number };
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: 0,
    minOrderTotal: 0,
    maxDiscount: 0,
    maxUsages: 0,
    expiresAt: "",
    isActive: true,
  });

  const loadPromos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo");
      const data = await res.json();
      setPromos(data.promoCodes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "PERCENT",
      discountValue: 0,
      minOrderTotal: 0,
      maxDiscount: 0,
      maxUsages: 0,
      expiresAt: "",
      isActive: true,
    });
  };

  const startEdit = (p: PromoCode) => {
    setIsCreating(false);
    setEditingId(p.id);
    setForm({
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderTotal: p.minOrderTotal || 0,
      maxDiscount: p.maxDiscount || 0,
      maxUsages: p.maxUsages || 0,
      expiresAt: p.expiresAt
        ? new Date(p.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: p.isActive,
    });
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      minOrderTotal: form.minOrderTotal || null,
      maxDiscount: form.maxDiscount || null,
      maxUsages: form.maxUsages || null,
      expiresAt: form.expiresAt || null,
    };

    try {
      const url = editingId
        ? `/api/admin/promo/${editingId}`
        : "/api/admin/promo";
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
        loadPromos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    try {
      await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
      loadPromos();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promo Codes ({promos.length})</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setIsCreating(true);
          }}
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background"
        >
          <Plus size={16} /> Add Promo Code
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 border border-border p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
            {editingId ? "Edit Promo Code" : "New Promo Code"}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="w-full border border-border px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Type</label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              >
                <option value="PERCENT">Percent (%)</option>
                <option value="FIXED">Fixed (tiyins)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Value ({form.discountType === "PERCENT" ? "%" : "tiyins"})
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountValue: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Min Order (tiyins, 0 = none)
              </label>
              <input
                type="number"
                value={form.minOrderTotal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minOrderTotal: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Max Discount (tiyins, 0 = none)
              </label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxDiscount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Max Usages (0 = unlimited)
              </label>
              <input
                type="number"
                value={form.maxUsages}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxUsages: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
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

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
            <th className="pb-3 pr-4">Code</th>
            <th className="pb-3 pr-4">Discount</th>
            <th className="pb-3 pr-4">Min Order</th>
            <th className="pb-3 pr-4">Usage</th>
            <th className="pb-3 pr-4">Expires</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-3 pr-4 font-mono font-bold">{p.code}</td>
              <td className="py-3 pr-4">
                {p.discountType === "PERCENT"
                  ? `${p.discountValue}%`
                  : formatPrice(p.discountValue)}
                {p.maxDiscount
                  ? ` (max ${formatPrice(p.maxDiscount)})`
                  : ""}
              </td>
              <td className="py-3 pr-4 text-muted">
                {p.minOrderTotal ? formatPrice(p.minOrderTotal) : "—"}
              </td>
              <td className="py-3 pr-4">
                {p.usedCount}
                {p.maxUsages ? ` / ${p.maxUsages}` : ""} ({p._count.orders}{" "}
                orders)
              </td>
              <td className="py-3 pr-4 text-xs text-muted">
                {p.expiresAt
                  ? new Date(p.expiresAt).toLocaleDateString("ru-RU")
                  : "Never"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`text-xs ${p.isActive ? "text-green-600" : "text-muted"}`}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-muted hover:text-foreground"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-muted hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {promos.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted">
                No promo codes yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
