import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";
import { useCart } from "@/hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { groupedBySeller, updateQuantity, removeItem, totalPrice, loading } = useCart();

  return (
    <Layout title={t("cart")} showHeader={false}>
      <div className="max-w-2xl mx-auto pb-32">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center h-14 px-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="ml-2 font-semibold">{t("cart")}</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12 text-muted-foreground text-sm">{t("loading")}</p>
        ) : groupedBySeller.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">{t("cartEmpty")}</p>
            <p className="text-sm text-muted-foreground">{t("cartEmptyDesc")}</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {groupedBySeller.map((group) => (
              <div key={group.sellerId} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  className="flex items-center gap-2 w-full p-3 bg-muted/40 text-left"
                  onClick={() => navigate(`/profile?user=${group.sellerId}`)}
                >
                  <div className="w-7 h-7 rounded-full bg-muted overflow-hidden">
                    {group.sellerAvatar && (
                      <img src={group.sellerAvatar} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{group.sellerName}</span>
                </button>
                <div className="divide-y divide-border">
                  {group.items.map((it) => (
                    <div key={it.id} className="p-3 flex gap-3">
                      <button
                        className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0"
                        onClick={() => navigate(`/product/${it.product.id}`)}
                      >
                        {it.product.images?.[0] && (
                          <img src={it.product.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{it.product.title}</p>
                        <p className="text-sm font-bold text-primary mt-0.5">
                          {Number(it.product.price).toFixed(2)} DA
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-6 text-center">{it.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive h-7 px-2"
                            onClick={() => removeItem(it.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 text-sm bg-muted/30">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="font-semibold">{group.subtotal.toFixed(2)} DA</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {groupedBySeller.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-40 md:left-auto">
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("total")}</span>
                <span className="text-xl font-bold text-primary">{totalPrice.toFixed(2)} DA</span>
              </div>
              <Button className="w-full" onClick={() => navigate("/checkout")}>
                {t("proceedToCheckout")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
