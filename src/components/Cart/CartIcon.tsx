import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

export const CartIcon = () => {
  const navigate = useNavigate();
  const { totalCount } = useCart();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={() => navigate("/cart")}
      aria-label="Cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {totalCount}
        </span>
      )}
    </Button>
  );
};
