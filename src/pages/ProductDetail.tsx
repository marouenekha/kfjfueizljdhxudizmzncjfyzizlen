import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShoppingCart, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
}
interface Seller {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (data) {
        setProduct(data as Product);
        const { data: prof } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .eq("user_id", data.user_id)
          .maybeSingle();
        if (prof) setSeller(prof as Seller);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleAdd = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await addToCart(product!.id, 1);
    toast({ title: t("addedToCart") });
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    await addToCart(product!.id, 1);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <Layout title={t("product")} showMobileNav={false}>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }
  if (!product) {
    return (
      <Layout title={t("product")} showMobileNav={false}>
        <p className="text-center py-20 text-muted-foreground">{t("productNotFound")}</p>
      </Layout>
    );
  }

  const images = product.images || [];

  return (
    <Layout title={t("product")} showHeader={false} showMobileNav={false}>
      <div className="max-w-5xl mx-auto pb-32">
        <div className="sticky top-0 z-30 glass border-b border-border">
          <div className="flex items-center h-14 px-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="ml-2 !text-base font-semibold truncate">{product.title}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 md:gap-10 md:p-8">
          {/* Image carousel */}
          <div className="relative bg-muted md:rounded-2xl overflow-hidden aspect-square md:aspect-auto md:min-h-[500px]">
            {images.length > 0 ? (
              <>
                <div
                  className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-none"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    setImgIdx(Math.round(el.scrollLeft / el.clientWidth));
                  }}
                >
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${product.title}-${i}`}
                      className="w-full h-full object-cover snap-center flex-shrink-0"
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full glass">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`block h-1.5 rounded-full transition-all ${
                          i === imgIdx ? "bg-secondary w-6" : "bg-muted-foreground/40 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                {t("noImage")}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="p-4 md:p-0 space-y-6">
            <div>
              <span className="eyebrow">Product</span>
              <h2 className="!text-3xl md:!text-4xl mt-2">{product.title}</h2>
              <div className="flex items-baseline gap-1.5 mt-3">
                <span className="price-chip !text-3xl md:!text-4xl text-secondary">
                  {product.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground font-medium">DA</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cash on delivery available</p>
            </div>

            {seller && (
              <button
                className="flex items-center gap-3 w-full text-left p-3 rounded-2xl border border-border hover:border-secondary/40 hover:bg-accent transition"
                onClick={() => navigate(`/profile?user=${seller.user_id}`)}
              >
                <div className="w-11 h-11 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  {seller.avatar_url && (
                    <img src={seller.avatar_url} alt={seller.name || ""} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{t("soldBy")}</p>
                  <p className="font-medium truncate">{seller.name}</p>
                </div>
                <span className="text-xs text-secondary font-medium">Visit →</span>
              </button>
            )}

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">{t("productDescription")}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Desktop action bar (inline) */}
            <div className="hidden md:flex gap-3 pt-4">
              <Button variant="outline" size="lg" className="flex-1 rounded-full" onClick={handleAdd}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t("addToCart")}
              </Button>
              <Button size="lg" className="flex-1 rounded-full" onClick={handleBuyNow}>
                <Zap className="w-4 h-4 mr-2" />
                {t("buyNow")}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile sticky action bar */}
        <div className="sticky-bar md:hidden p-3">
          <div className="max-w-2xl mx-auto flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full h-12" onClick={handleAdd}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t("addToCart")}
            </Button>
            <Button className="flex-1 rounded-full h-12" onClick={handleBuyNow}>
              <Zap className="w-4 h-4 mr-2" />
              {t("buyNow")}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;

