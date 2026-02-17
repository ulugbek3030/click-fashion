"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, ChevronRight, Package } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    translations: { name: string }[];
    images: { url: string }[];
  };
  variant: {
    color: { name: string; hexCode: string };
    size: { name: string };
  };
}

interface Order {
  id: string;
  status: string;
  deliveryType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  subtotal: number;
  discount: number;
  giftDiscount: number;
  deliveryFee: number;
  total: number;
  note: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null };
  items: OrderItem[];
  payments: { id: string; method: string; status: string; amount: number }[];
  pickupPoint: { name: string } | null;
}

const statusColors: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  PAYMENT_PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  FULFILLING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-200 text-gray-500",
  REFUNDED: "bg-orange-100 text-orange-700",
};

const statusTransitions: Record<string, string[]> = {
  CREATED: ["CANCELED"],
  PAYMENT_PENDING: ["CANCELED"],
  PAID: ["FULFILLING", "CANCELED"],
  FULFILLING: ["SHIPPED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: ["REFUNDED"],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update");
      }
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders ({total})</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or ID..."
          className="flex-1 max-w-xs border border-border px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && loadOrders()}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-border px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setPage(1);
            loadOrders();
          }}
          className="bg-foreground px-4 py-2 text-sm text-background"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted">Loading...</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const nextStatuses = statusTransitions[order.status] || [];

            return (
              <div key={order.id} className="border border-border">
                {/* Order header */}
                <div
                  className="flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-neutral-50"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <span className="font-mono text-xs">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-sm">
                    {order.contactName}
                  </span>
                  <span className="text-xs text-muted">
                    {order.contactPhone}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusColors[order.status] || "bg-gray-100"}`}
                  >
                    {order.status}
                  </span>
                  <span className="ml-auto text-sm font-medium">
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left: Order info */}
                      <div>
                        <h3 className="mb-2 text-xs font-bold uppercase text-muted">
                          Order Details
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted">Customer:</span>{" "}
                            {order.user.name || order.user.email || "—"}
                          </p>
                          <p>
                            <span className="text-muted">Contact:</span>{" "}
                            {order.contactName}, {order.contactPhone}
                          </p>
                          {order.contactEmail && (
                            <p>
                              <span className="text-muted">Email:</span>{" "}
                              {order.contactEmail}
                            </p>
                          )}
                          <p>
                            <span className="text-muted">Delivery:</span>{" "}
                            {order.deliveryType === "COURIER"
                              ? `Courier — ${order.deliveryCity}, ${order.deliveryAddress}`
                              : `Pickup — ${order.pickupPoint?.name || "—"}`}
                          </p>
                          {order.note && (
                            <p>
                              <span className="text-muted">Note:</span>{" "}
                              {order.note}
                            </p>
                          )}
                        </div>

                        {/* Amounts */}
                        <div className="mt-3 space-y-1 text-sm">
                          <p>
                            Subtotal: {formatPrice(order.subtotal)}
                          </p>
                          {order.discount > 0 && (
                            <p className="text-green-600">
                              Promo: -{formatPrice(order.discount)}
                            </p>
                          )}
                          {order.giftDiscount > 0 && (
                            <p className="text-green-600">
                              Gift: -{formatPrice(order.giftDiscount)}
                            </p>
                          )}
                          {order.deliveryFee > 0 && (
                            <p>
                              Delivery: {formatPrice(order.deliveryFee)}
                            </p>
                          )}
                          <p className="font-bold">
                            Total: {formatPrice(order.total)}
                          </p>
                        </div>

                        {/* Payments */}
                        {order.payments.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-bold uppercase text-muted">
                              Payments
                            </h4>
                            {order.payments.map((p) => (
                              <p key={p.id} className="text-sm">
                                {p.method} — {p.status} —{" "}
                                {formatPrice(p.amount)}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Status Actions */}
                        {nextStatuses.length > 0 && (
                          <div className="mt-4 flex gap-2">
                            {nextStatuses.map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                disabled={updating === order.id}
                                className={`px-3 py-1.5 text-xs ${
                                  s === "CANCELED"
                                    ? "border border-red-300 text-red-600 hover:bg-red-50"
                                    : "bg-foreground text-background hover:bg-foreground/90"
                                } disabled:opacity-50`}
                              >
                                {updating === order.id
                                  ? "..."
                                  : `→ ${s}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Items */}
                      <div>
                        <h3 className="mb-2 text-xs font-bold uppercase text-muted">
                          Items ({order.items.length})
                        </h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                            >
                              {item.product.images[0]?.url ? (
                                <img
                                  src={item.product.images[0].url}
                                  alt=""
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center bg-neutral-100">
                                  <Package size={14} className="text-muted" />
                                </div>
                              )}
                              <div className="flex-1 text-sm">
                                <p className="font-medium">
                                  {item.product.translations[0]?.name || "—"}
                                </p>
                                <p className="text-xs text-muted">
                                  {item.variant.color.name} /{" "}
                                  {item.variant.size.name} × {item.quantity}
                                </p>
                              </div>
                              <span className="text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="py-8 text-center text-muted">No orders found</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 text-sm border ${
                p === page
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-neutral-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
