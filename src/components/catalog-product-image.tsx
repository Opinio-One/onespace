"use client";

import { useState } from "react";

interface ProductImageProps {
  imageUrl: string | null;
  productName: string;
  fallbackIcon: React.ReactNode;
}

export function ProductImage({
  imageUrl,
  productName,
  fallbackIcon,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
        <div className="text-center">
          {fallbackIcon}
          <div className="text-sm">No Image</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={productName}
        className="w-full h-full object-contain p-4"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <div className="text-center">
            {fallbackIcon}
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}
    </>
  );
}
