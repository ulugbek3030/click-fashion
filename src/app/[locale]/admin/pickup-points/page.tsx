"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

interface PickupPoint {
  id: string;
  name: string;
  nameUz: string | null;
  nameEn: string | null;
  address: string;
  addressUz: string | null;
  addressEn: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  isActive: boolean;
  _count: { orders: number };
}

export default function AdminPickupPointsPage() {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nameUz: "",
    nameEn: "",
    address: "",
    addressUz: "",
    addressEn: "",
    lat: "",
    lng: "",
    phone: "",
    isActive: true,
  });

  const loadPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pickup-points");
      const data = await res.json();
      setPoints(data.points || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);

  const resetForm = () => {
    setForm({
      name: "",
      nameUz: "",
      nameEn: "",
      address: "",
      addressUz: "",
      addressEn: "",
      lat: "",
      lng: "",
      phone: "",
      isActive: true,
    });
  };

  const startEdit = (p: PickupPoint) => {
    setIsCreating(false);
    setEditingId(p.id);
    setForm({
      name: p.name,
      nameUz: p.nameUz || "",
      nameEn: p.nameEn || "",
      address: p.address,
      addressUz: p.addressUz || "",
      addressEn: p.addressEn || "",
      lat: p.lat?.toString() || "",
      lng: p.lng?.toString() || "",
      phone: p.phone || "",
      isActive: p.isActive,
    });
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
    };

    try {
      const url = editingId
        ? `/api/admin/pickup-points/${editingId}`
        : "/api/admin/pickup-points";
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
        loadPoints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pickup point?")) return;
    try {
      await fetch(`/api/admin/pickup-points/${id}`, { method: "DELETE" });
      loadPoints();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Pickup Points ({points.length})
        </h1>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setIsCreating(true);
          }}
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background"
        >
          <Plus size={16} /> Add Point
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <div className="mb-6 border border-border p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
            {editingId ? "Edit Pickup Point" : "New Pickup Point"}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">
                Name (RU)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Name (UZ)
              </label>
              <input
                type="text"
                value={form.nameUz}
                onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Name (EN)
              </label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Address (RU)
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Address (UZ)
              </label>
              <input
                type="text"
                value={form.addressUz}
                onChange={(e) =>
                  setForm({ ...form, addressUz: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Address (EN)
              </label>
              <input
                type="text"
                value={form.addressEn}
                onChange={(e) =>
                  setForm({ ...form, addressEn: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Latitude
              </label>
              <input
                type="text"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="41.2995"
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Longitude
              </label>
              <input
                type="text"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                placeholder="69.2401"
                className="w-full border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
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
            <div className="flex-1" />
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

      {/* List */}
      <div className="space-y-2">
        {points.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border border-border px-4 py-3">
            <MapPin
              size={16}
              className={p.isActive ? "text-green-600" : "text-muted"}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted">{p.address}</p>
            </div>
            {p.phone && <span className="text-xs text-muted">{p.phone}</span>}
            <span className="text-xs text-muted">
              {p._count.orders} orders
            </span>
            <span
              className={`text-xs ${p.isActive ? "text-green-600" : "text-muted"}`}
            >
              {p.isActive ? "Active" : "Inactive"}
            </span>
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
        ))}
        {points.length === 0 && (
          <div className="py-8 text-center text-muted">
            No pickup points yet
          </div>
        )}
      </div>
    </div>
  );
}
