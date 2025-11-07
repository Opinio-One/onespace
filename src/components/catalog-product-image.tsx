"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  imageUrl: string | null;
  productName: string;
  fallbackIcon: React.ReactNode;
  className?: string;
  showLoadingState?: boolean;
}

export function ProductImage({
  imageUrl,
  productName,
  fallbackIcon,
  className,
  showLoadingState = true,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!imageUrl) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500",
          className
        )}
      >
        <div className="text-center">
          {fallbackIcon}
          <div className="text-sm font-medium">No Image</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {imageLoading && showLoadingState && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-xs text-gray-500">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={productName}
        className={cn(
          "w-full h-full object-contain p-4 transition-opacity duration-300",
          imageLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
      {imageError && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500",
            className
          )}
        >
          <div className="text-center">
            {fallbackIcon}
            <div className="text-sm font-medium">Image unavailable</div>
          </div>
        </div>
      )}
    </>
  );
}
