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
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { RatingModal } from "@/components/RatingModal";
import { PortfolioManager } from "@/components/PortfolioManager";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRating, setUserRating] = useState({ rating: 0, count: 0 });
  const [followerCount, setFollowerCount] = useState(0);
  const [jobsCompleted, setJobsCompleted] = useState(0);
  const viewingUserId = searchParams.get('user');
  const isOwnProfile = !viewingUserId || viewingUserId === authUser?.id;
  
  // Determine which user's profile we're viewing
  const user = isOwnProfile ? (authUser?.profile ? {
    id: authUser.id,
    name: authUser.profile.name || "User",
    avatar: authUser.profile.avatar_url,
    bio: authUser.profile.bio || "Welcome to my profile! 👋",
    location: authUser.profile.location || "Location not set",
    isProvider: authUser.profile.is_provider,
    serviceTypes: authUser.profile.service_types || [],
    phone: authUser.profile.phone,
    joinedDate: new Date().toISOString(),
    isOnline: true
  } : null) : userProfile;

  useEffect(() => {
    if (viewingUserId && viewingUserId !== authUser?.id) {
      fetchOtherUserProfile();
    } else if (authUser?.id) {
      fetchUserPosts(authUser.id);
      fetchUserRating(authUser.id);
      fetchFollowerCount(authUser.id);
      fetchJobsCompleted(authUser.id);
    }
  }, [viewingUserId, authUser?.id]);

  const fetchOtherUserProfile = async () => {
    if (!viewingUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', viewingUserId)
        .single();

      if (error) throw error;
      
      setUserProfile({
        id: viewingUserId,
        name: data.name || "User",
        avatar: data.avatar_url,
        bio: data.bio || "Welcome to my profile! 👋",
        location: data.location || "Location not set",
        isProvider: data.is_provider,
        serviceTypes: data.service_types || [],
        phone: data.phone,
        joinedDate: data.created_at,
        isOnline: false
      });

      fetchUserPosts(viewingUserId);
      fetchUserRating(viewingUserId);
      fetchFollowerCount(viewingUserId);
      fetchJobsCompleted(viewingUserId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setUserRating({ rating: avgRating, count: data.length });
      } else {
        setUserRating({ rating: 0, count: 0 });
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    console.log('Starting to fetch user posts for:', userId);
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('User posts query result:', { data, error });

      if (error) {
        console.error('Error fetching user posts:', error);
        throw error;
      }
      
      console.log('Setting user posts:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Error in fetchUserPosts:', error);
    }
  };

  const fetchFollowerCount = async (userId: string) => {
    try {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      
      setFollowerCount(count || 0);
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const fetchJobsCompleted = async (userId: string) => {
    try {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', userId)
        .eq('status', 'completed');
      
      setJobsCompleted(count || 0);
    } catch (error) {
      console.error('Error fetching jobs completed:', error);
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
        {/* Profile Header - No Cover Image */}
        <div className="pt-4 space-y-6">
          {/* Profile Picture & Basic Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xl">{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {user?.isOnline && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold">{user?.name}</h1>
                    {user?.isProvider && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Provider
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    {user?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user?.joinedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(user.joinedDate).getFullYear()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button size="sm" onClick={() => setShowEditDialog(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => setShowRatingModal(true)}>
                        <Star className="w-4 h-4 mr-2" />
                        Rate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/messages?user=${user?.id}`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Bio and Service Types */}
          {user?.bio && (
            <p className="text-sm leading-relaxed">{user.bio}</p>
          )}

          {user?.serviceTypes && user.serviceTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.serviceTypes.map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center space-x-6 py-3 text-center">
            <div>
              <div className="font-bold text-base">{followerCount}</div>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div>
              <div className="font-bold text-base">{jobsCompleted}</div>
              <span className="text-xs text-muted-foreground">Jobs Completed</span>
            </div>
            <div>
              {userRating.count > 0 ? (
                <div className="font-bold text-base">⭐ {userRating.rating.toFixed(1)} ({userRating.count})</div>
              ) : (
                <div className="font-bold text-base">⭐ No ratings</div>
              )}
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
          </div>
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
            <PortfolioManager userId={user?.id || ""} isOwnProfile={isOwnProfile} />
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
        
        {/* Dialogs */}
        <ProfileEditDialog 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog} 
        />
        
        {user && !isOwnProfile && (
          <RatingModal
            open={showRatingModal}
            onOpenChange={setShowRatingModal}
            userId={user.id}
            userName={user.name}
            onRatingSubmitted={() => fetchUserRating(user.id)}
          />
        )}
      </div>
    </Layout>
  );
}