import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Search, X, Plus, Edit, Trash2, Loader2, ImagePlus, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { AddEditProductDialog } from "@/components/Profile/AddEditProductDialog";

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
}

interface StoreTabProps {
  userId: string;
  isOwnProfile: boolean;
}

export const StoreTab = ({ userId, isOwnProfile }: StoreTabProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [userId]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const handleDelete = async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({ title: t("productDeleted") });
    }
  };

  const filtered = searchQuery
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{t("noStoreItems")}</h3>
        <p className="text-sm text-muted-foreground">{t("noStoreItemsDesc")}</p>
        {isOwnProfile && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("addProduct")}
          </Button>
        )}
        <AddEditProductDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSaved={fetchProducts}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      {isOwnProfile && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("addProduct")}
          </Button>
        </div>
      )}

      {/* Conditional search bar: only if > 20 products */}
      {products.length > 20 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("searchProducts")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 rounded-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="border border-border rounded-lg overflow-hidden bg-card flex flex-col"
          >
            {/* Product image */}
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className="aspect-square bg-muted flex items-center justify-center overflow-hidden text-left"
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
              )}
            </button>

            {/* Product info */}
            <div className="p-2.5 space-y-1 flex-1 flex flex-col">
              <button onClick={() => navigate(`/product/${product.id}`)} className="text-left">
                <h4 className="text-sm font-medium truncate">{product.title}</h4>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
                <p className="text-sm font-bold text-primary mt-1">
                  {product.price.toFixed(2)} DA
                </p>
              </button>

              {/* Owner actions */}
              {isOwnProfile ? (
                <div className="flex gap-1 pt-1 mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {t("edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {t("delete")}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="h-8 text-xs mt-auto"
                  onClick={async () => {
                    await addToCart(product.id, 1);
                    toast({ title: t("addedToCart") });
                  }}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {t("addToCart")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && searchQuery && (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t("noSearchResults")}
        </p>
      )}

      <AddEditProductDialog
        open={showAddDialog || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingProduct(null);
          }
        }}
        product={editingProduct}
        onSaved={fetchProducts}
      />
    </div>
  );
};
