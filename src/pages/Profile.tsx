import { useState, useEffect } from "react";
import { Edit, Star, MapPin, Calendar, Award, Users, MessageCircle, FileText, Loader2, UserPlus, UserCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingDisplay } from "@/components/ui/rating-display";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { RatingModal } from "@/components/RatingModal";
import { PostCard } from "@/components/Feed/PostCard";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRating, setUserRating] = useState({ rating: 0, count: 0 });
  const [followerCount, setFollowerCount] = useState(0);
  const [jobsCompleted, setJobsCompleted] = useState(0);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
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
    const targetId = viewingUserId && viewingUserId !== authUser?.id ? viewingUserId : authUser?.id;
    if (viewingUserId && viewingUserId !== authUser?.id) {
      fetchOtherUserProfile();
      checkFollowStatus(viewingUserId);
    } else if (authUser?.id) {
      fetchUserRating(authUser.id);
      fetchFollowerCount(authUser.id);
      fetchJobsCompleted(authUser.id);
    }
    if (targetId) {
      fetchUserPosts(targetId);
      fetchReviews(targetId);
    }
  }, [viewingUserId, authUser?.id]);

  const checkFollowStatus = async (targetId: string) => {
    if (!authUser?.id) return;
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', authUser.id)
        .eq('following_id', targetId)
        .maybeSingle();
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!authUser?.id || !user?.id || isOwnProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', authUser.id)
          .eq('following_id', user.id);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: authUser.id, following_id: user.id });
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

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

      fetchUserRating(viewingUserId);
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
        .select('rater_id, rating, created_at')
        .eq('rated_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Only keep latest rating per rater for the average
        const latestByRater = new Map<string, number>();
        for (const r of data) {
          if (!latestByRater.has(r.rater_id)) {
            latestByRater.set(r.rater_id, r.rating);
          }
        }
        const ratings = Array.from(latestByRater.values());
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        setUserRating({ rating: avgRating, count: ratings.length });
      } else {
        setUserRating({ rating: 0, count: 0 });
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
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

  const handleDeleteReview = async (reviewId: string) => {
    const targetId = viewingUserId || authUser?.id;
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
      if (targetId) {
        fetchUserRating(targetId);
        fetchReviews(targetId);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const fetchReviews = async (userId: string) => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch rater profiles
      if (data && data.length > 0) {
        const raterIds = [...new Set(data.map(r => r.rater_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', raterIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched = data.map(r => ({
          ...r,
          rater_name: profileMap.get(r.rater_id)?.name || 'User',
          rater_avatar: profileMap.get(r.rater_id)?.avatar_url,
        }));
        setReviews(enriched);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };


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
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
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
                <div className="flex flex-wrap gap-2">
                  {isOwnProfile ? (
                    <Button size="sm" onClick={() => setShowEditDialog(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                      >
                        {followLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : isFollowing ? (
                          <UserCheck className="w-4 h-4 mr-2" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowRatingModal(true)}>
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
          
          <TabsContent value="posts" className="mt-4">
            {postsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No post exists</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No portfolio items yet</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4">
            {reviewsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Aucun avis</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isOwnProfile 
                    ? "Complétez votre premier travail pour recevoir des avis !"
                    : "Cet utilisateur n'a pas encore reçu d'avis."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={review.rater_avatar} />
                          <AvatarFallback className="text-xs">{review.rater_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{review.rater_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        {review.rater_id === authUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            onRatingSubmitted={() => {
              fetchUserRating(user.id);
              fetchReviews(user.id);
            }}
          />
        )}
      </div>
    </Layout>
  );
}