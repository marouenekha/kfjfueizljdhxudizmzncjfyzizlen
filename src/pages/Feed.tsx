import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingCart, ImagePlus, ShoppingBag, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

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

type SortKey = "recent" | "low" | "high";

export default function Feed() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, user_id, title, price, images, description, created_at")
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      const list = (data as any[]) || [];
      const sellerIds = Array.from(new Set(list.map(p => p.user_id)));
      const sellers: Record<string, any> = {};
      if (sellerIds.length) {
        const { data: profs } = await supabase
          .from("profiles").select("user_id, username, name, avatar_url").in("user_id", sellerIds);
        (profs as any[] || []).forEach(p => { sellers[p.user_id] = p; });
      }
      setProducts(list.map(p => ({ ...p, seller: sellers[p.user_id] })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const featured = products[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = products.filter(p =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.seller?.name?.toLowerCase().includes(q) ||
      p.seller?.username?.toLowerCase().includes(q)
    );
    if (sort === "low") arr = [...arr].sort((a, b) => a.price - b.price);
    else if (sort === "high") arr = [...arr].sort((a, b) => b.price - a.price);
    return arr;
  }, [products, query, sort]);

  const handleAdd = async (p: MarketProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(p.id, 1);
    toast({ title: t('addedToCart'), description: p.title });
  };

  return (
    <Layout title="ServiceHub" showMenu={true}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30" style={{ background: "var(--gradient-accent)", filter: "blur(80px)" }} />
        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-10 md:pt-14 md:pb-16">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="eyebrow">{t('market')}</span>
          </div>
          <h1 className="max-w-2xl">
            {t('discoverServices')}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground text-base md:text-lg">
            Curated products from independent sellers. Cash on delivery. No middlemen.
          </p>

          {/* Search + sort */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, sellers…"
                className="pl-11 pr-10 h-12 rounded-full bg-card/80 backdrop-blur border-border shadow-sm"
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
            <div className="flex gap-1 p-1 rounded-full bg-card/80 backdrop-blur border border-border shadow-sm">
              {([
                { k: "recent", label: "New" },
                { k: "low", label: "Low $" },
                { k: "high", label: "High $" },
              ] as { k: SortKey; label: string }[]).map((opt) => (
                <button
                  key={opt.k}
                  onClick={() => setSort(opt.k)}
                  className={cn(
                    "px-4 h-10 rounded-full text-sm font-medium transition-colors",
                    sort === opt.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* Featured banner */}
        {!loading && featured && !query && (
          <button
            onClick={() => navigate(`/product/${featured.id}`)}
            className="group relative w-full overflow-hidden rounded-3xl border border-border bg-card text-left animate-fade-in"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-[4/3] md:aspect-auto bg-muted overflow-hidden">
                {featured.images?.[0] ? (
                  <img src={featured.images[0]} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center gap-4">
                <span className="eyebrow">Featured</span>
                <h2 className="!text-3xl md:!text-4xl">{featured.title}</h2>
                {featured.description && (
                  <p className="text-muted-foreground line-clamp-3">{featured.description}</p>
                )}
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="price-chip !text-2xl md:!text-3xl">{Number(featured.price).toFixed(2)}</span>
                  <span className="currency text-muted-foreground text-sm">DA</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                    View product →
                  </div>
                  {featured.seller && (
                    <span className="text-sm text-muted-foreground">by {featured.seller.name || featured.seller.username}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card">
                <div className="skeleton aspect-square" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-accent">
              <ShoppingBag className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">{query ? "No matches" : t('noStoreItems')}</h3>
            <p className="text-sm text-muted-foreground">
              {query ? "Try a different search term." : "New products drop every day. Check back soon."}
            </p>
          </div>
        ) : (
          <div>
            {!query && <h2 className="mb-4 !text-xl md:!text-2xl">All products</h2>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((p, idx) => (
                <article
                  key={p.id}
                  className="product-card group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${Math.min(idx, 8) * 30}ms` }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={(e) => handleAdd(p, e)}
                      className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                      aria-label={t('addToCart')}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 md:p-4 space-y-2">
                    <h4 className="text-sm md:text-base font-medium leading-tight line-clamp-1">{p.title}</h4>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="price-chip text-base">
                        {Number(p.price).toFixed(2)}
                        <span className="currency ml-1">DA</span>
                      </span>
                    </div>
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
                      variant="outline"
                      className="w-full h-9 text-xs md:hidden"
                      onClick={(e) => handleAdd(p, e)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                      {t('addToCart')}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
