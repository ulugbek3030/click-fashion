import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const [productsCount, ordersCount, usersCount, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

  const totalRevenue = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "COMPLETED", "SHIPPED", "FULFILLING"] } },
    _sum: { total: true },
  });

  const stats = [
    {
      label: "Products",
      value: productsCount,
      icon: Package,
    },
    {
      label: "Orders",
      value: ordersCount,
      icon: ShoppingCart,
    },
    {
      label: "Users",
      value: usersCount,
      icon: Users,
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue._sum.total || 0),
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-border p-4">
            <div className="flex items-center gap-2 text-muted">
              <stat.icon size={16} />
              <span className="text-xs uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="pb-3 pr-4">Order</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-border">
                <td className="py-3 pr-4 font-mono text-xs">
                  {order.id.slice(-8).toUpperCase()}
                </td>
                <td className="py-3 pr-4">
                  {order.user.name || order.user.email || "—"}
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs">
                    {order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 font-medium">
                  {formatPrice(order.total)}
                </td>
                <td className="py-3 text-muted">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
