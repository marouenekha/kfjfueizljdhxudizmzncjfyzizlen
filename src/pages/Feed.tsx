import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { PostCard } from "@/components/Feed/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Loader2, ShoppingCart, ImagePlus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  seller?: { username: string | null; name: string | null; avatar_url: string | null };
}

export default function Feed() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [tab, setTab] = useState<"feed" | "market">("feed");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => { fetchPosts(); fetchProducts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      setPosts(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

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

  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tab === "feed" ? t('feed') : t('market')}</h1>
            <p className="text-sm text-muted-foreground">{t('discoverServices')}</p>
          </div>
          {tab === "feed" && (
            <Button size="sm" onClick={() => navigate("/create-post")}>
              <Plus className="w-4 h-4 mr-1" /> {t('post')}
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="feed">{t('feed')}</TabsTrigger>
            <TabsTrigger value="market">{t('market')}</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4">
            {loading ? (
              <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{t('noPostsYet')}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">{t('beFirstToPost')}</p>
                <Button onClick={() => navigate("/create-post")}>{t('createPost')}</Button>
              </div>
            ) : (
              <div className="space-y-0 -mx-4 border-t border-border">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={fetchPosts} onPostDeleted={fetchPosts} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="market" className="mt-4">
            {productsLoading ? (
              <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{t('noStoreItems')}</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="border border-border rounded-lg overflow-hidden bg-card flex flex-col">
                    <button
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="aspect-square bg-muted flex items-center justify-center overflow-hidden text-left"
                    >
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                    <div className="p-2.5 space-y-1 flex-1 flex flex-col">
                      <button onClick={() => navigate(`/product/${p.id}`)} className="text-left">
                        <h4 className="text-sm font-medium truncate">{p.title}</h4>
                        <p className="text-sm font-bold text-primary mt-1">{Number(p.price).toFixed(2)} DA</p>
                      </button>
                      {p.seller && (
                        <button
                          onClick={() => navigate(`/profile?user=${p.user_id}`)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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
                        className="h-8 text-xs mt-auto"
                        onClick={async () => { await addToCart(p.id, 1); toast({ title: t('addedToCart') }); }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {t('addToCart')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
