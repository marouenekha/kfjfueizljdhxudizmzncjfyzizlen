import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  reviews: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  rating, 
  reviews, 
  className,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={cn("flex items-center gap-1", sizeClasses[size], className)}>
      <Star className={cn("fill-yellow-400 text-yellow-400", starSizes[size])} />
      <span className="font-medium">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground">({reviews})</span>
    </div>
  );
};