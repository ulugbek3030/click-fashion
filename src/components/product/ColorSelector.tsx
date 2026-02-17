"use client";

import { cn } from "@/lib/utils";

interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onSelect: (colorId: string) => void;
}

export default function ColorSelector({
  colors,
  selectedColor,
  onSelect,
}: ColorSelectorProps) {
  if (colors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          className={cn(
            "h-8 w-8 rounded-full border-2 transition-all",
            selectedColor === color.id
              ? "border-foreground ring-2 ring-foreground ring-offset-2"
              : "border-border hover:border-foreground/50"
          )}
          style={{ backgroundColor: color.hexCode }}
          title={color.name}
          aria-label={color.name}
        />
      ))}
    </div>
  );
}
