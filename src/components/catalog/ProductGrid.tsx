import ProductCard from "./ProductCard";

interface ProductGridItem {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  imageUrl: string;
  imageAlt?: string;
  isNew: boolean;
  isFeatured: boolean;
  colors: { hexCode: string; name: string }[];
}

interface ProductGridProps {
  products: ProductGridItem[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          basePrice={product.basePrice}
          salePrice={product.salePrice}
          imageUrl={product.imageUrl}
          imageAlt={product.imageAlt}
          isNew={product.isNew}
          isFeatured={product.isFeatured}
          colors={product.colors}
        />
      ))}
    </div>
  );
}
