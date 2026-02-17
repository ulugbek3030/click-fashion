"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: { id: string; url: string; alt: string | null }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-neutral-100 flex items-center justify-center text-muted">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:flex-col sm:w-20">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[3/4] w-16 sm:w-full overflow-hidden border-2 transition-colors",
                index === activeIndex
                  ? "border-foreground"
                  : "border-transparent hover:border-border"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-white/80 hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-white/80 hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
