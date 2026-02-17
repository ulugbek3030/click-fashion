"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Gift {
  id: string;
  code: string;
  initialAmount: number;
  balance: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    code: "",
    initialAmount: 0,
    balance: 0,
    expiresAt: "",
    isActive: true,
  });

  const loadGifts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gifts");
      const data = await res.json();
      setGifts(data.gifts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  const resetForm = () => {
    setForm({
      code: "",
      initialAmount: 0,
      balance: 0,
      expiresAt: "",
      isActive: true,
    });
  };

  const startEdit = (g: Gift) => {
    setIsCreating(false);
    setEditingId(g.id);
    setForm({
      code: g.code,
      initialAmount: g.initialAmount,
      balance: g.balance,
      expiresAt: g.expiresAt
        ? new Date(g.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: g.isActive,
    });
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      expiresAt: form.expiresAt || null,
    };

    try {
      const url = editingId
        ? `/api/admin/gifts/${editingId}`
        : "/api/admin/gifts";
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
        loadGifts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gift certificate?")) return;
    try {
      await fetch(`/api/admin/gifts/${id}`, { method: "DELETE" });
      loadGifts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Gift Certificates ({gifts.length})
        </h1>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setIsCreating(true);
          }}
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background"
        >
          <Plus size={16} /> Add Certificate
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 border border-border p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
            {editingId ? "Edit Certificate" : "New Certificate"}
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
              <label className="mb-1 block text-xs text-muted">
                Initial Amount (tiyins)
              </label>
              <input
                type="number"
                value={form.initialAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    initialAmount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            {editingId && (
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Current Balance (tiyins)
                </label>
                <input
                  type="number"
                  value={form.balance}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      balance: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-border px-3 py-2 text-sm"
                />
              </div>
            )}
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
            <th className="pb-3 pr-4">Initial</th>
            <th className="pb-3 pr-4">Balance</th>
            <th className="pb-3 pr-4">Used</th>
            <th className="pb-3 pr-4">Expires</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((g) => (
            <tr key={g.id} className="border-b border-border">
              <td className="py-3 pr-4 font-mono font-bold">{g.code}</td>
              <td className="py-3 pr-4">
                {formatPrice(g.initialAmount)}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={
                    g.balance === 0 ? "text-muted" : "text-green-600 font-medium"
                  }
                >
                  {formatPrice(g.balance)}
                </span>
              </td>
              <td className="py-3 pr-4 text-muted">
                {g._count.orders} orders
              </td>
              <td className="py-3 pr-4 text-xs text-muted">
                {g.expiresAt
                  ? new Date(g.expiresAt).toLocaleDateString("ru-RU")
                  : "Never"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`text-xs ${g.isActive ? "text-green-600" : "text-muted"}`}
                >
                  {g.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(g)}
                    className="text-muted hover:text-foreground"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-muted hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {gifts.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted">
                No gift certificates yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
