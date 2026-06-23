import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag, ImagePlus } from "lucide-react";

interface Profile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  username: string;
}
interface Product {
  id: string;
  title: string;
  price: number;
  description: string | null;
  images: string[] | null;
}

const PublicStore = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!username) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, bio, username")
        .ilike("username", username)
        .maybeSingle();
      if (prof) {
        setProfile(prof as Profile);
        const { data: prods } = await supabase
          .from("products")
          .select("id, title, price, description, images")
          .eq("user_id", (prof as Profile).user_id)
          .order("created_at", { ascending: false });
        setProducts((prods as Product[]) || []);
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mb-3" />
        <h1 className="text-xl font-semibold">Store not found</h1>
      </div>
    );
  }

  const storeName = `${profile.name || profile.username}'s Store`;
  const desc = profile.bio || `Browse products from ${profile.name || profile.username}`;

  return (
    <>
      <Helmet>
        <title>{storeName}</title>
        <meta name="description" content={desc.slice(0, 160)} />
        <link rel="canonical" href={`${window.location.origin}/store/${profile.username}`} />
        <meta property="og:title" content={storeName} />
        <meta property="og:description" content={desc.slice(0, 160)} />
        <meta property="og:type" content="website" />
        {profile.avatar_url && <meta property="og:image" content={profile.avatar_url} />}
      </Helmet>

      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <header className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex-shrink-0">
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt={profile.name || ""} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{storeName}</h1>
              {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>}
            </div>
          </header>

          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No products yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/store/${profile.username}/${p.id}`}
                  className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <h2 className="text-sm font-medium truncate">{p.title}</h2>
                    <p className="text-sm font-bold text-primary mt-1">{Number(p.price).toFixed(2)} DA</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default PublicStore;
