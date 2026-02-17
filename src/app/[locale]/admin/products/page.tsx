import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; gender?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const search = params.search || "";
  const gender = params.gender || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.translations = {
      some: { name: { contains: search, mode: "insensitive" } },
    };
  }
  if (gender) {
    where.gender = gender;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        translations: { where: { locale: "ru" } },
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { include: { translations: { where: { locale: "ru" } } } },
        _count: { select: { variants: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products ({total})</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <form className="mb-6 flex gap-4">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name..."
          className="border border-border px-3 py-2 text-sm flex-1 max-w-xs"
        />
        <select
          name="gender"
          defaultValue={gender}
          className="border border-border px-3 py-2 text-sm"
        >
          <option value="">All Genders</option>
          <option value="MEN">Men</option>
          <option value="WOMEN">Women</option>
          <option value="UNISEX">Unisex</option>
        </select>
        <button
          type="submit"
          className="bg-foreground px-4 py-2 text-sm text-background"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="pb-3 pr-4">Image</th>
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">SKU</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Variants</th>
              <th className="pb-3 pr-4">Orders</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const name =
                product.translations[0]?.name || product.sku;
              const image = product.images[0]?.url;
              const categoryName =
                product.category?.translations[0]?.name || "—";

              return (
                <tr key={product.id} className="border-b border-border">
                  <td className="py-3 pr-4">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center bg-neutral-100 text-xs text-muted">
                        —
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium">{name}</td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {product.sku}
                  </td>
                  <td className="py-3 pr-4 text-muted">{categoryName}</td>
                  <td className="py-3 pr-4">
                    <div>{formatPrice(product.basePrice)}</div>
                    {product.salePrice && (
                      <div className="text-xs text-red-600">
                        {formatPrice(product.salePrice)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">{product._count.variants}</td>
                  <td className="py-3 pr-4">{product._count.orderItems}</td>
                  <td className="py-3 pr-4">
                    {product.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <Eye size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <EyeOff size={12} /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                    >
                      <Edit size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}${search ? `&search=${search}` : ""}${gender ? `&gender=${gender}` : ""}`}
              className={`px-3 py-1 text-sm border ${
                p === page
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-neutral-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
