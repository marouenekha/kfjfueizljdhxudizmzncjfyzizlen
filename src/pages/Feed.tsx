import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { PostCard } from "@/components/Feed/PostCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      console.log("Fetching posts...");
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Posts query result:", { data, error });

      if (error) {
        setErrorMessage(error.message);
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Unknown error");
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Feed</h1>
            <p className="text-muted-foreground">Discover services from the community</p>
          </div>
          {user && (
            <Button onClick={() => navigate("/create-post")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            <p>Loading posts...</p>
          ) : errorMessage ? (
            <p className="text-red-500">Error: {errorMessage}</p>
          ) : posts.length > 0 ? (
            <div className="grid gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p>No posts found. Try creating a post!</p>
          )}
        </div>
      </div>
    </Layout>
  );
}