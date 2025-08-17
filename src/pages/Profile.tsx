import { useState, useEffect } from "react";
import { Edit, Settings, Share, Star, MapPin, Calendar, Award, Users, MessageCircle, UserPlus, Phone, Plus, FileText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/Feed/PostCard";
import { RatingDisplay } from "@/components/ui/rating-display";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const viewingOtherUser = searchParams.get('user');
  const isOwnProfile = !viewingOtherUser || viewingOtherUser === 'me';
  
  // Use actual user data when available, with fallbacks for empty state
  const user = authUser?.profile ? {
    id: authUser.id,
    name: authUser.profile.name || "User",
    avatar: authUser.profile.avatar_url,
    bio: authUser.profile.bio || "Welcome to my profile! 👋",
    location: authUser.profile.location || "Location not set",
    isProvider: authUser.profile.is_provider,
    serviceTypes: authUser.profile.service_types || [],
    rating: 4.5, // Default rating
    reviewCount: 0,
    completedJobs: 0,
    followers: 0,
    following: 0,
    priceRange: "Contact for pricing",
    responseTime: "New user",
    joinedDate: new Date().toISOString().split('T')[0],
    isOnline: true,
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop"
  } : null;

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUserPosts = async () => {
    if (!user?.id) return;
    
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while auth is loading or if user exists but profile is still loading
  if (authLoading || (authUser && !authUser.profile)) {
    return (
      <Layout title="Profile">
        <div className="container-mobile py-8 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!authUser) {
    return (
      <Layout title="Profile">
        <div className="container-mobile py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Please sign in</h3>
          <p className="text-muted-foreground">You need to be logged in to view this profile.</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }
  return (
    <Layout title="Profile">
      <div className="container-mobile pb-4">
        {/* Cover Image */}
        <div className="relative -mx-4 -mt-0">
          <div 
            className="h-24 sm:h-32 md:h-40 bg-gradient-to-r from-primary to-primary-dark"
            style={{
              backgroundImage: `url(${user.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Profile Picture */}
          <div className="absolute -bottom-6 sm:-bottom-8 left-3 sm:left-4">
            <div className="relative">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 border-background">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-base sm:text-lg">{user.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute bottom-0 sm:bottom-1 right-0 sm:right-1 w-4 h-4 sm:w-6 sm:h-6 bg-accent rounded-full border-2 sm:border-3 border-background"></div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex gap-2">
            <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur p-2">
              <Share className="w-4 h-4" />
            </Button>
            {isOwnProfile && (
              <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur p-2">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-8 sm:mt-12 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-lg sm:text-xl font-bold truncate">{user.name}</h1>
                {user.isProvider && (
                  <Badge variant="secondary" className="text-xs self-start sm:self-center">
                    <Award className="w-3 h-3 mr-1" />
                    Verified Provider
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {new Date(user.joinedDate).getFullYear()}</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-4">{user.bio}</p>

              {/* Service Types */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(user.serviceTypes || []).map((service) => (
                  <Badge key={service} variant="outline" className="service-badge service-badge-home text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {isOwnProfile ? (
              <Button size="sm" className="self-start sm:ml-4">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2 self-start sm:ml-4">
                <Button 
                  size="sm" 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="flex-1 sm:flex-none"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate("/messages")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-xl">
            <div className="text-center">
              <RatingDisplay 
                rating={user.rating} 
                reviews={user.reviewCount} 
                size="lg"
                className="justify-center mb-1"
              />
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg">{user.reviewCount}</div>
              <span className="text-xs text-muted-foreground">Reviews</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg">{user.completedJobs}</div>
              <span className="text-xs text-muted-foreground">Jobs</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg">{user.followers}</div>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
          </div>

          {/* Provider Info */}
          {user.isProvider && (
            <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price Range:</span>
                <span className="font-medium">{user.priceRange}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Response Time:</span>
                <span className="font-medium text-accent">{user.responseTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No posts yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isOwnProfile 
                    ? "Share your work and connect with potential clients by creating your first post!"
                    : "This user hasn't shared any posts yet."
                  }
                </p>
                {isOwnProfile && (
                  <Button onClick={() => navigate('/create-post')} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="portfolio" className="mt-4">
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Award className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Portfolio coming soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Portfolio feature will be available in a future update.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4">
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No reviews yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isOwnProfile 
                  ? "Complete your first job to start receiving reviews from clients!"
                  : "This user hasn't received any reviews yet."
                }
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}