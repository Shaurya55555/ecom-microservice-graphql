"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getCategory } from "@/lib/categories";

/**
 * Product artwork. Uses the seller-supplied image when there is one and falls
 * back to a flat, category-toned swatch with a simple icon when there isn't
 * (or it fails to load), so cards never render a broken-image icon.
 */
export function ProductImage({
  src,
  alt,
  category,
  className,
  iconClassName,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  category?: string | null;
  /** Kept for call-site compatibility; the swatch is no longer randomised. */
  seed?: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;
  const cat = getCategory(category);
  const Icon = cat.icon;

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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div role="img" aria-label={alt} className={cn("flex h-full w-full items-center justify-center", cat.tone)}>
          <Icon
            className={cn("h-1/4 w-1/4 text-fg/35", iconClassName)}
            strokeWidth={1}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
