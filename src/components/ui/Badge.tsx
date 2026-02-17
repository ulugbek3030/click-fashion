import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "sale" | "new" | "outline";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-foreground text-background",
    sale: "bg-destructive text-white",
    new: "bg-foreground text-background",
    outline: "border border-border text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
