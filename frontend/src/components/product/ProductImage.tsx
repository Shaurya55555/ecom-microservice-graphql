"use client";

import { useState } from "react";
import { cn, hashString } from "@/lib/utils";
import { getCategory } from "@/lib/categories";

/**
 * Product artwork. Uses the seller-supplied image when there is one and falls
 * back to a category-themed illustration when there isn't (or it fails to load),
 * so cards never render a broken-image icon.
 */
export function ProductImage({
  src,
  alt,
  category,
  seed,
  className,
  iconClassName,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  category?: string | null;
  seed: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;
  const cat = getCategory(category);
  const Icon = cat.icon;
  const angle = hashString(seed, 4) * 90;

  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {showImage ? (
        // Seller-provided URLs can point anywhere, so next/image's remotePatterns allowlist doesn't fit here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", cat.gradient)}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--line-strong) 1px, transparent 0)",
              backgroundSize: "18px 18px",
              transform: `rotate(${angle}deg) scale(1.5)`,
            }}
          />
          <Icon
            className={cn("relative h-1/3 w-1/3 text-fg/45", iconClassName)}
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
