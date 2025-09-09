import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error.message);
          setError("❌ Supabase fetch error: " + error.message);
          return;
        }

        if (!data || data.length === 0) {
          console.warn("No posts found in database.");
          setError("⚠️ No posts found in database.");
          return;
        }

        setPosts(data);
      } catch (err: any) {
        console.error("Unexpected error:", err.message);
        setError("🔥 Unexpected error: " + err.message);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        {error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : (
          <p className="text-green-600 font-bold">
            ✅ {posts.length} posts fetched successfully, but feed hidden for debug
          </p>
        )}
      </div>
    </Layout>
  );
}