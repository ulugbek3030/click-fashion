"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl transition-transform duration-300 ease-in-out",
          side === "right" && "right-0",
          side === "left" && "left-0",
          side === "right" && (isOpen ? "translate-x-0" : "translate-x-full"),
          side === "left" && (isOpen ? "translate-x-0" : "-translate-x-full"),
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {title && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
