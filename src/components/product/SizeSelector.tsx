"use client";

import { cn } from "@/lib/utils";

interface SizeOption {
  id: string;
  name: string;
  inStock: boolean;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string | null;
  onSelect: (sizeId: string) => void;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size.id}
          onClick={() => size.inStock && onSelect(size.id)}
          disabled={!size.inStock}
          className={cn(
            "flex h-10 min-w-[44px] items-center justify-center border px-3 text-sm font-medium transition-colors",
            selectedSize === size.id
              ? "border-foreground bg-foreground text-background"
              : size.inStock
              ? "border-border hover:border-foreground"
              : "border-border/50 text-muted-foreground line-through opacity-50 cursor-not-allowed"
          )}
        >
          {size.name}
        </button>
      ))}
    </div>
  );
}
