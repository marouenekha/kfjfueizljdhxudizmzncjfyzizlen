import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { PostCard } from "@/components/Feed/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Feed</h1>
            <p className="text-sm text-muted-foreground">Discover services</p>
          </div>
          <Button size="sm" onClick={() => navigate("/create-post")}>
            <Plus className="w-4 h-4 mr-1" /> Post
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No posts yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to post a service request or offer!
            </p>
            <Button onClick={() => navigate("/create-post")}>Create Post</Button>
          </div>
        ) : (
          <div className="space-y-0 -mx-4 border-t border-border">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onPostUpdated={fetchPosts}
                onPostDeleted={fetchPosts}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
