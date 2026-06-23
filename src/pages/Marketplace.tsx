import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User as UserIcon, Store as StoreIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/Layout/MobileNav";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "electronics", label: "Electronics" },
  { key: "clothes", label: "Clothes" },
  { key: "food", label: "Food" },
  { key: "handmade", label: "Handmade" },
  { key: "beauty", label: "Beauty" },
  { key: "home", label: "Home" },
  { key: "digital", label: "Digital" },
  { key: "other", label: "Other" },
];

interface MarketProduct {
  id: string;
  user_id: string;
  title: string;
  price: number;
  images: string[] | null;
  category: string | null;
  seller_name: string | null;
  seller_username: string | null;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalCount } = useCart();

  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: prods } = await supabase
        .from("products")
        .select("id,user_id,title,price,images,category")
        .order("created_at", { ascending: false })
        .limit(200);

      const list = (prods as any[]) || [];
      const userIds = Array.from(new Set(list.map((p) => p.user_id)));
      let profilesMap: Record<string, { name: string | null; username: string | null }> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id,name,username")
          .in("user_id", userIds);
        (profs as any[] | null)?.forEach((p) => {
          profilesMap[p.user_id] = { name: p.name, username: p.username };
        });
      }

      setProducts(
        list.map((p) => ({
          ...p,
          seller_name: profilesMap[p.user_id]?.name ?? null,
          seller_username: profilesMap[p.user_id]?.username ?? null,
        }))
      );
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && (p.category || "other") !== category) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [products, category, query]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2.5 flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate("/feed")}
            className="shrink-0 font-extrabold text-lg md:text-xl text-primary tracking-tight"
          >
            ServiceHub
          </button>

          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-primary"
            />
          </div>

          <button
            onClick={() => navigate("/cart")}
            className="relative shrink-0 p-2 text-slate-700 hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {totalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate(user ? "/profile" : "/auth")}
            className="shrink-0 p-2 text-slate-700 hover:text-primary"
            aria-label="Profile"
          >
            <UserIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-3 md:px-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 py-2.5 min-w-min">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                    category === c.key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="flex-1 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4">
          <h1 className="sr-only">Marketplace</h1>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: MarketProduct }) {
  const navigate = useNavigate();
  const img = product.images?.[0];
  return (
    <article className="group rounded-xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg hover:border-primary/40 transition-all flex flex-col">
      <button
        onClick={() => navigate(`/product/${product.id}`)}
        className="block aspect-square w-full bg-slate-100 overflow-hidden"
      >
        {img ? (
          <img
            src={img}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <StoreIcon className="w-10 h-10" />
          </div>
        )}
      </button>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-left text-sm font-medium text-slate-800 line-clamp-2 hover:text-primary"
        >
          {product.title}
        </button>
        <div className="text-base font-bold text-primary">
          {Number(product.price).toLocaleString()} DA
        </div>
        {product.seller_username && (
          <button
            onClick={() => navigate(`/store/${product.seller_username}`)}
            className="text-xs text-slate-500 hover:text-primary truncate text-left"
          >
            by {product.seller_name || product.seller_username}
          </button>
        )}
        <Button
          size="sm"
          className="mt-auto w-full bg-primary hover:bg-primary/90 text-white"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          Buy Now
        </Button>
      </div>
    </article>
  );
}
