import { useState, useEffect } from "react";
import { Edit, Star, MapPin, Calendar, Award, Users, MessageCircle, FileText, Loader2, UserPlus, UserCheck, Trash2, ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale/ar";
import { fr } from "date-fns/locale/fr";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/ui/rating-display";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { RatingModal } from "@/components/RatingModal";
import { PostCard } from "@/components/Feed/PostCard";
import { SwipeableTabs } from "@/components/Profile/SwipeableTabs";
import { StoreTab } from "@/components/Profile/StoreTab";
import { PortfolioTab } from "@/components/Profile/PortfolioTab";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = i18n.language === 'ar' ? ar : i18n.language === 'fr' ? fr : undefined;
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
  const [activeTab, setActiveTab] = useState("posts");
  const viewingUserId = searchParams.get('user');
  const isOwnProfile = !viewingUserId || viewingUserId === authUser?.id;
  
  const user = isOwnProfile ? (authUser?.profile ? {
    id: authUser.id, name: authUser.profile.name || "User", avatar: authUser.profile.avatar_url,
    bio: authUser.profile.bio || "", location: authUser.profile.location || "",
    isProvider: authUser.profile.is_provider, serviceTypes: authUser.profile.service_types || [],
    phone: authUser.profile.phone, joinedDate: new Date().toISOString(), isOnline: true,
    profileRole: (authUser.profile as any).profile_role || "seller",
  } : null) : userProfile;

  // Determine visible tabs based on profile role
  const getVisibleTabs = () => {
    const role = user?.profileRole || 'seller';
    const tabs: { key: string; label: string }[] = [];

    // Seller mode: only Store + Reviews
    if (role === 'seller') {
      tabs.push({ key: "store", label: t("store") });
      tabs.push({ key: "reviews", label: t("reviews") });
      return tabs;
    }

    // Posts visible for provider/both
    if (userPosts.length > 0 || isOwnProfile) {
      tabs.push({ key: "posts", label: t("posts") });
    }

    // Portfolio: provider and both
    if (role === 'provider' || role === 'both') {
      tabs.push({ key: "portfolio", label: t("portfolio") });
    }

    // Store: both
    if (role === 'both') {
      tabs.push({ key: "store", label: t("store") });
    }

    tabs.push({ key: "reviews", label: t("reviews") });

    return tabs;
  };

  const visibleTabs = getVisibleTabs();

  // Reset active tab if current one is not in visible tabs
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [user?.profileRole, visibleTabs.length]);

  useEffect(() => {
    const targetId = viewingUserId && viewingUserId !== authUser?.id ? viewingUserId : authUser?.id;
    if (viewingUserId && viewingUserId !== authUser?.id) {
      fetchOtherUserProfile(); checkFollowStatus(viewingUserId);
    } else if (authUser?.id) {
      fetchUserRating(authUser.id); fetchFollowerCount(authUser.id); fetchJobsCompleted(authUser.id);
    }
    if (targetId) { fetchUserPosts(targetId); fetchReviews(targetId); }
  }, [viewingUserId, authUser?.id]);

  const checkFollowStatus = async (targetId: string) => {
    if (!authUser?.id) return;
    const { data } = await supabase.from('follows').select('id').eq('follower_id', authUser.id).eq('following_id', targetId).maybeSingle();
    setIsFollowing(!!data);
  };

  const handleFollowToggle = async () => {
    if (!authUser?.id || !user?.id || isOwnProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', authUser.id).eq('following_id', user.id);
        setIsFollowing(false); setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase.from('follows').insert({ follower_id: authUser.id, following_id: user.id });
        setIsFollowing(true); setFollowerCount(prev => prev + 1);
      }
    } catch (error) { console.error('Error toggling follow:', error); }
    finally { setFollowLoading(false); }
  };

  const fetchUserPosts = async (userId: string) => {
    setPostsLoading(true);
    const { data } = await supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setUserPosts(data || []); setPostsLoading(false);
  };

  const fetchOtherUserProfile = async () => {
    if (!viewingUserId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', viewingUserId).single();
      if (error) throw error;
      setUserProfile({
        id: viewingUserId, name: data.name || "User", avatar: data.avatar_url,
        bio: data.bio || "", location: data.location || "",
        isProvider: data.is_provider, serviceTypes: data.service_types || [],
        phone: data.phone, joinedDate: data.created_at, isOnline: false,
        profileRole: (data as any).profile_role || "seller",
      });
      fetchUserRating(viewingUserId); fetchFollowerCount(viewingUserId); fetchJobsCompleted(viewingUserId);
    } catch (error) { console.error('Error:', error); setUserProfile(null); }
    finally { setLoading(false); }
  };

  const fetchUserRating = async (userId: string) => {
    const { data } = await supabase.from('ratings').select('rater_id, rating, created_at').eq('rated_id', userId).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      const latestByRater = new Map<string, number>();
      for (const r of data) { if (!latestByRater.has(r.rater_id)) latestByRater.set(r.rater_id, r.rating); }
      const ratings = Array.from(latestByRater.values());
      setUserRating({ rating: ratings.reduce((s, r) => s + r, 0) / ratings.length, count: ratings.length });
    } else { setUserRating({ rating: 0, count: 0 }); }
  };

  const fetchFollowerCount = async (userId: string) => {
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    setFollowerCount(count || 0);
  };

  const fetchJobsCompleted = async (userId: string) => {
    const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('provider_id', userId).eq('status', 'completed');
    setJobsCompleted(count || 0);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const targetId = viewingUserId || authUser?.id;
    await supabase.from('ratings').delete().eq('id', reviewId);
    if (targetId) { fetchUserRating(targetId); fetchReviews(targetId); }
  };

  const fetchReviews = async (userId: string) => {
    setReviewsLoading(true);
    const { data } = await supabase.from('ratings').select('*').eq('rated_id', userId).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      const raterIds = [...new Set(data.map(r => r.rater_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, name, avatar_url').in('user_id', raterIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setReviews(data.map(r => ({ ...r, rater_name: profileMap.get(r.rater_id)?.name || 'User', rater_avatar: profileMap.get(r.rater_id)?.avatar_url })));
    } else { setReviews([]); }
    setReviewsLoading(false);
  };

  if (authLoading || (authUser && !authUser.profile)) {
    return (<Layout title={t('profile')}><div className="w-full max-w-2xl mx-auto px-4 py-8 text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">{t('loadingProfile')}</p>
    </div></Layout>);
  }

  if (!authUser) {
    return (<Layout title={t('profile')}><div className="w-full max-w-2xl mx-auto px-4 py-8 text-center space-y-4">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center"><Users className="w-8 h-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold">{t('pleaseSignIn')}</h3>
      <p className="text-muted-foreground">{t('needLoginProfile')}</p>
      <Button onClick={() => navigate('/auth')}>{t('signIn')}</Button>
    </div></Layout>);
  }

  const renderRoleBadge = () => {
    const role = user?.profileRole;
    if (role === 'both') {
      return (
        <>
          <Badge variant="secondary" className="text-xs"><Award className="w-3 h-3 mr-1" />{t('provider')}</Badge>
          <Badge variant="outline" className="text-xs"><ShoppingBag className="w-3 h-3 mr-1" />{t('seller')}</Badge>
        </>
      );
    }
    if (role === 'seller') {
      return <Badge variant="outline" className="text-xs"><ShoppingBag className="w-3 h-3 mr-1" />{t('seller')}</Badge>;
    }
    if (user?.isProvider) {
      return <Badge variant="secondary" className="text-xs"><Award className="w-3 h-3 mr-1" />{t('provider')}</Badge>;
    }
    return null;
  };

  return (
    <Layout title={t('profile')}>
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
        <div className="pt-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xl">{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              {user?.isOnline && <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold">{user?.name}</h1>
                    {renderRoleBadge()}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    {user?.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{user.location}</span></div>}
                    {user?.joinedDate && <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{t('joined')} {new Date(user.joinedDate).getFullYear()}</span></div>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isOwnProfile ? (
                    <Button size="sm" onClick={() => setShowEditDialog(true)}><Edit className="w-4 h-4 mr-2" />{t('editProfile')}</Button>
                  ) : (
                    <>
                      <Button size="sm" variant={isFollowing ? "secondary" : "default"} onClick={handleFollowToggle} disabled={followLoading}>
                        {followLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isFollowing ? <UserCheck className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                        {isFollowing ? t('following') : t('follow')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowRatingModal(true)}><Star className="w-4 h-4 mr-2" />{t('rate')}</Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/messages?user=${user?.id}`)}><MessageCircle className="w-4 h-4 mr-2" />{t('message')}</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {user?.bio && <p className="text-sm leading-relaxed">{user.bio}</p>}
          {user?.serviceTypes && user.serviceTypes.length > 0 && (user?.profileRole === 'provider' || user?.profileRole === 'both') && (
            <div className="flex flex-wrap gap-2">{user.serviceTypes.map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
          )}

          <div className="flex justify-center space-x-6 py-3 text-center">
            <div><div className="font-bold text-base">{followerCount}</div><span className="text-xs text-muted-foreground">{t('followers')}</span></div>
            <div><div className="font-bold text-base">{jobsCompleted}</div><span className="text-xs text-muted-foreground">{t('jobsCompleted')}</span></div>
            <div>
              {userRating.count > 0 ? <div className="font-bold text-base">⭐ {userRating.rating.toFixed(1)} ({userRating.count})</div>
                : <div className="font-bold text-base">⭐ {t('noRatings')}</div>}
              <span className="text-xs text-muted-foreground">{t('rating')}</span>
            </div>
          </div>
        </div>

        <SwipeableTabs tabs={visibleTabs} activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "posts" && (
            <>
              {postsLoading ? <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
              : userPosts.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center"><FileText className="w-8 h-8 text-muted-foreground" /></div>
                  <h3 className="text-lg font-semibold">{t('noPostExists')}</h3>
                </div>
              ) : <div className="space-y-4">{userPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>}
            </>
          )}

          {activeTab === "portfolio" && <PortfolioTab userId={user?.id || ""} isOwnProfile={isOwnProfile} />}

          {activeTab === "store" && <StoreTab userId={user?.id || ""} isOwnProfile={isOwnProfile} />}
          
          {activeTab === "reviews" && (
            <>
              {reviewsLoading ? <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
              : reviews.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center"><Star className="w-8 h-8 text-muted-foreground" /></div>
                  <h3 className="text-lg font-semibold">{t('noReviews')}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">{isOwnProfile ? t('noReviewsOwn') : t('noReviewsOther')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8"><AvatarImage src={review.rater_avatar} /><AvatarFallback className="text-xs">{review.rater_name?.[0] || 'U'}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium">{review.rater_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: dateFnsLocale })}</span>
                          {review.rater_id === authUser?.id && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteReview(review.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />)}</div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </SwipeableTabs>
        
        <ProfileEditDialog open={showEditDialog} onOpenChange={setShowEditDialog} />
        {user && !isOwnProfile && (
          <RatingModal open={showRatingModal} onOpenChange={setShowRatingModal} userId={user.id} userName={user.name}
            onRatingSubmitted={() => { fetchUserRating(user.id); fetchReviews(user.id); }} />
        )}
      </div>
    </Layout>
  );
}
