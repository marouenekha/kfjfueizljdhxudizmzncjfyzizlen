import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShoppingCart, Zap } from "lucide-react";

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
}
interface Profile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  username: string;
}

const PublicProduct = () => {
  const { username, productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    (async () => {
      if (!productId || !username) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, username")
        .ilike("username", username)
        .maybeSingle();
      if (!prof) { setLoading(false); return; }
      setSeller(prof as Profile);
      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("user_id", (prof as Profile).user_id)
        .maybeSingle();
      if (prod) setProduct(prod as Product);
      setLoading(false);
    })();
  }, [productId, username]);

  const handleAdd = async () => {
    if (!user) { navigate("/auth"); return; }
    await addToCart(product!.id, 1);
    toast({ title: "Added to cart" });
  };
  const handleBuyNow = async () => {
    if (!user) { navigate("/auth"); return; }
    await addToCart(product!.id, 1);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product || !seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-xl font-semibold">Product not found</h1>
        {seller && (
          <Link to={`/store/${seller.username}`} className="text-primary mt-3 underline">
            Back to store
          </Link>
        )}
      </div>
    );
  }

  const images = product.images || [];
  const desc = product.description || `${product.title} — ${Number(product.price).toFixed(2)} DA`;
  const url = `${window.location.origin}/store/${seller.username}/${product.id}`;

  return (
    <>
      <Helmet>
        <title>{`${product.title} — ${seller.name || seller.username}`}</title>
        <meta name="description" content={desc.slice(0, 160)} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={desc.slice(0, 160)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={url} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="DZD" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.title,
          description: desc,
          image: images,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "DZD",
            availability: "https://schema.org/InStock",
            url,
          },
          brand: seller.name || seller.username,
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-background pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
            <div className="flex items-center h-14 px-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${seller.username}`)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="ml-2 font-semibold truncate">{product.title}</h1>
            </div>
          </div>

          <div className="relative bg-muted aspect-square">
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
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`block w-1.5 h-1.5 rounded-full ${i === imgIdx ? "bg-primary" : "bg-background/70"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{product.title}</h2>
              <p className="text-2xl font-bold text-primary mt-1">{Number(product.price).toFixed(2)} DA</p>
            </div>

            <Link
              to={`/store/${seller.username}`}
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted transition"
            >
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {seller.avatar_url && (
                  <img src={seller.avatar_url} alt={seller.name || ""} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Sold by</p>
                <p className="font-medium truncate">{seller.name || seller.username}</p>
              </div>
            </Link>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-40">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Button variant="outline" size="icon" onClick={handleContact} aria-label="Contact seller">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleAdd}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to cart
              </Button>
              <Button className="flex-1" onClick={handleBuyNow}>
                <Zap className="w-4 h-4 mr-2" />
                Buy now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PublicProduct;
