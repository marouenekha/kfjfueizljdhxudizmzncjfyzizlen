import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingCart, ImagePlus, ShoppingBag, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

interface MarketProduct {
  id: string;
  user_id: string;
  title: string;
  price: number;
  images: string[] | null;
  description: string | null;
  created_at?: string;
  seller?: { username: string | null; name: string | null; avatar_url: string | null };
}

export default function Feed() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, user_id, title, price, images, description, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const list = (data as any[]) || [];
      const sellerIds = Array.from(new Set(list.map(p => p.user_id)));
      let sellers: Record<string, any> = {};
      if (sellerIds.length) {
        const { data: profs } = await supabase
          .from("profiles").select("user_id, username, name, avatar_url").in("user_id", sellerIds);
        (profs as any[] || []).forEach(p => { sellers[p.user_id] = p; });
      }
      setProducts(list.map(p => ({ ...p, seller: sellers[p.user_id] })));
    } catch (e) { console.error(e); } finally { setProductsLoading(false); }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.seller?.name?.toLowerCase().includes(q) ||
      p.seller?.username?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleAdd = async (p: MarketProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(p.id, 1);
    toast({ title: t('addedToCart'), description: p.title });
  };

  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{t('market')}</h1>
          <p className="text-sm text-muted-foreground">{t('discoverServices')}</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, sellers…"
            className="pl-11 pr-10 h-11 rounded-full bg-card border-border"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="product-card">
                <div className="skeleton aspect-square" />
                <div className="p-2.5 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-accent">
              <ShoppingBag className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">{query ? "No matches" : t('noStoreItems')}</h3>
            {query && <p className="text-sm text-muted-foreground">Try a different search term.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="product-card cursor-pointer"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2.5 space-y-1">
                  <h4 className="text-sm font-medium truncate">{p.title}</h4>
                  <span className="price-chip text-sm">
                    {Number(p.price).toFixed(2)}
                    <span className="currency ml-1">DA</span>
                  </span>
                  {p.seller && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile?user=${p.user_id}`); }}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {p.seller.avatar_url ? (
                        <img src={p.seller.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-muted" />
                      )}
                      <span className="truncate">{p.seller.name || p.seller.username}</span>
                    </button>
                  )}
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs mt-1"
                    onClick={(e) => handleAdd(p, e)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    {t('addToCart')}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
            }
                
