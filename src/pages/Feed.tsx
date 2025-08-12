import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { PostCard } from "@/components/Feed/PostCard";
import { ServiceCategoryFilter } from "@/components/Feed/ServiceCategoryFilter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Users } from "lucide-react";

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            name,
            avatar_url,
            is_provider,
            service_types
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.service_type === selectedCategory)
    : posts;

  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="container-mobile space-y-4 py-4">

        {/* Service Category Filter */}
        <ServiceCategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Be the first to share your work! Create a post to showcase your services and connect with potential clients.
              </p>
              <Button onClick={() => navigate('/create-post')} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          )}
        </div>

        {filteredPosts.length > 0 && (
          <div className="flex justify-center py-8">
            <button className="px-6 py-2 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}