import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, ExternalLink, ShoppingCart } from "lucide-react";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "featured" | "compact";
  featured?: boolean;
}

interface EnhancedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  featured?: boolean;
}

interface EnhancedCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showActions?: boolean;
  onViewDetails?: () => void;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

interface EnhancedCardImageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  aspectRatio?: "square" | "video" | "portrait";
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    { className, children, variant = "default", featured = false, ...props },
    ref
  ) => {
    const baseClasses =
      "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300";

    const variantClasses = {
      default: "hover:shadow-lg hover:-translate-y-1",
      featured:
        "ring-2 ring-primary/20 hover:shadow-xl hover:-translate-y-2 hover:ring-primary/40",
      compact: "hover:shadow-md hover:-translate-y-0.5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          featured && "bg-gradient-to-br from-primary/5 to-secondary/5",
          className
        )}
        {...props}
      >
        {featured && (
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant="default"
              className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
            >
              Featured
            </Badge>
          </div>
        )}
        {children}
      </div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  EnhancedCardHeaderProps
>(
  (
    {
      className,
      children,
      badge,
      badgeVariant = "secondary",
      featured = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col space-y-3 p-6",
          featured && "pb-4",
          className
        )}
        {...props}
      >
        {badge && (
          <div className="flex justify-between items-start">
            <Badge variant={badgeVariant} className="text-xs font-medium">
              {badge}
            </Badge>
          </div>
        )}
        {children}
      </div>
    );
  }
);
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardImage = React.forwardRef<
  HTMLDivElement,
  EnhancedCardImageProps
>(({ className, children, overlay, aspectRatio = "square", ...props }, ref) => {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100",
        aspectClasses[aspectRatio],
        "group-hover:scale-105 transition-transform duration-300",
        className
      )}
      {...props}
    >
      {children}
      {overlay && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {overlay}
        </div>
      )}
    </div>
  );
});
EnhancedCardImage.displayName = "EnhancedCardImage";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  EnhancedCardContentProps
>(
  (
    {
      className,
      children,
      showActions = true,
      onViewDetails,
      onAddToCart,
      onToggleFavorite,
      isFavorite = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col flex-grow p-6 pt-0", className)}
        {...props}
      >
        <div className="flex-grow space-y-3">{children}</div>

        {showActions && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={onViewDetails}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
              {onAddToCart && (
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                  onClick={onAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 hover:bg-red-50 hover:text-red-600"
                  onClick={onToggleFavorite}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    )}
                  />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground line-clamp-2", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

// Specialized components for product cards
interface ProductSpecProps {
  label: string;
  value: string | number;
  badge?: boolean;
  badgeColor?: string;
  icon?: React.ReactNode;
}

const ProductSpec = ({
  label,
  value,
  badge = false,
  badgeColor,
  icon,
}: ProductSpecProps) => {
  if (badge) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground flex items-center gap-2">
          {icon}
          {label}:
        </span>
        <Badge
          variant="secondary"
          className={cn("text-xs font-medium", badgeColor)}
        >
          {value}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}:
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
};

interface PriceDisplayProps {
  price: number;
  currency?: string;
  originalPrice?: number;
  discount?: number;
  className?: string;
}

const PriceDisplay = ({
  price,
  currency = "€",
  originalPrice,
  discount,
  className,
}: PriceDisplayProps) => {
  const formatPrice = (value: number) => {
    return value.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-lg font-bold text-green-600">
        {currency}
        {formatPrice(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-sm text-muted-foreground line-through">
          {currency}
          {formatPrice(originalPrice)}
        </span>
      )}
      {discount && discount > 0 && (
        <Badge variant="destructive" className="text-xs">
          -{discount}%
        </Badge>
      )}
    </div>
  );
};

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardImage,
  EnhancedCardContent,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardFooter,
  ProductSpec,
  PriceDisplay,
};


