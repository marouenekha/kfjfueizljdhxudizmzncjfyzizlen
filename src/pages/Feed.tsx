import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { PostCard } from "@/components/Feed/PostCard";
import { ServiceCategoryFilter } from "@/components/Feed/ServiceCategoryFilter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Feed() {
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [posts, setPosts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
const { user } = useAuth();

useEffect(() => {
fetchPosts();
}, []);

const fetchPosts = async () => {
try {
console.log('Fetching posts...');
const { data, error } = await supabase
.from('posts')
.select(  *,   profiles!posts_user_id_fkey (   name,   avatar_url,   is_provider   )  )
.order('created_at', { ascending: false });

console.log('Posts query result:', { data, error });  
  if (error) throw error;  

  setPosts(data || []);  
  console.log('Posts set to state:', data?.length || 0);  
} catch (error) {  
  console.error('Error fetching posts:', error);  
} finally {  
  setLoading(false);  
}

};

const filteredPosts = selectedCategory
? posts.filter(post => post.service_category === selectedCategory)
: posts;

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
<Button onClick={() => navigate('/create-post')} className="gap-2">
<Plus className="w-4 h-4" />
Create Post
</Button>
)}
</div>

{/* Service Category Filter */}  
    <ServiceCategoryFilter   
      selectedCategory={selectedCategory}  
      onCategoryChange={setSelectedCategory}  
    />  

    {/* Posts Feed */}  
    <div className="space-y-6">  
      {loading ? (  
        <div className="flex justify-center py-12">  
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>  
        </div>  
      ) : filteredPosts.length > 0 ? (  
        <div className="grid gap-6">  
          {filteredPosts.map((post) => (  
            <PostCard key={post.id} post={post} />  
          ))}  
        </div>  
      ) : (  
        <div className="text-center py-16 space-y-4">  
          <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">  
            <Users className="w-10 h-10 text-muted-foreground" />  
          </div>  
          <h3 className="text-xl font-semibold">No posts yet</h3>  
          <p className="text-muted-foreground max-w-md mx-auto">  
            Be the first to share your work! Create a post to showcase your services and connect with potential clients.  
          </p>  
          {user && (  
            <Button onClick={() => navigate('/create-post')} className="mt-6 gap-2">  
              <Plus className="w-4 h-4" />  
              Create First Post  
            </Button>  
          )}  
        </div>  
      )}  
    </div>  

    {/* Load More */}  
    {filteredPosts.length > 0 && (  
      <div className="flex justify-center py-8">  
        <Button variant="outline" className="px-8">  
          Load More Posts  
        </Button>  
      </div>  
    )}  
  </div>  
</Layout>

);
}

When I create a post it doesn't appear

