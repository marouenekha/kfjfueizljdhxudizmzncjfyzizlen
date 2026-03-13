import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Search,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Send,
  MoreHorizontal,
  Edit3,
  Trash2,
  Repeat2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale/ar";
import { fr } from "date-fns/locale/fr";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SharePostDialog } from "./SharePostDialog";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string | null;
  user_name: string;
  user_avatar: string | null;
  role: string | null;
  content: string | null;
  images: string[] | null;
  post_type: string;
  media_type: string;
  video_url: string | null;
  created_at: string | null;
  shared_post_id?: string | null;
  original_user_id?: string | null;
  original_user_name?: string | null;
  original_user_avatar?: string | null;
}

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

interface Comment {
  id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
}

export function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { t, i18n } = useTranslation();
  const dateFnsLocale = i18n.language === 'ar' ? ar : i18n.language === 'fr' ? fr : undefined;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const images = post.images || [];
  const isCarousel = post.media_type === "carousel" && images.length > 1;
  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateFnsLocale })
    : "";

  useEffect(() => {
    loadLikes();
    loadCommentCount();
  }, [post.id, authUser?.id]);

  const loadLikes = async () => {
    const { count } = await supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", post.id);
    setLikeCount(count || 0);
    if (authUser?.id) {
      const { data } = await supabase.from("post_likes").select("id").eq("post_id", post.id).eq("user_id", authUser.id).maybeSingle();
      setLiked(!!data);
    }
  };

  const loadCommentCount = async () => {
    const { count } = await supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id);
    setCommentCount(count || 0);
  };

  const loadComments = async () => {
    const { data } = await supabase.from("post_comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    setComments((data as Comment[]) || []);
  };

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % images.length);
  const prevSlide = () => setCurrentSlide((p) => (p === 0 ? images.length - 1 : p - 1));

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < images.length - 1) nextSlide();
      if (diff < 0 && currentSlide > 0) prevSlide();
    }
    setTouchStart(null); setTouchEnd(null);
  };

  const handleLike = async () => {
    if (!authUser?.id) return;
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", authUser.id);
      setLiked(false); setLikeCount((p) => p - 1);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: authUser.id });
      setLiked(true); setLikeCount((p) => p + 1);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !authUser?.id) return;
    const { error } = await supabase.from("post_comments").insert({
      post_id: post.id, user_id: authUser.id,
      user_name: authUser.profile?.name || "User",
      user_avatar: authUser.profile?.avatar_url || null,
      content: commentText.trim(),
    });
    if (!error) { setCommentText(""); setCommentCount((p) => p + 1); loadComments(); }
  };

  const handleToggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next) loadComments();
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
      toast.success(t('postDeleted'));
      onPostDeleted?.();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(t('failedToDeletePost'));
    }
    setShowDeleteDialog(false);
  };

  const handleContact = () => {
    if (post.user_id) navigate(`/messages?user=${post.user_id}`);
  };

  const contentTruncated = post.content && post.content.length > 120 && !expanded;
  const displayContent = contentTruncated ? post.content!.slice(0, 120) + "..." : post.content;

  return (
    <div className="bg-card border-b border-border">
      {/* Repost indicator */}
      {post.shared_post_id && (
        <div className="flex items-center gap-1.5 px-4 pt-2 text-xs text-muted-foreground">
          <Repeat2 className="w-3.5 h-3.5" />
          <span>{post.user_name} {t('repostedBy').toLowerCase()}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-primary/20"
          onClick={() => {
            const profileId = post.shared_post_id ? post.original_user_id : post.user_id;
            if (profileId) navigate(`/profile?user=${profileId}`);
          }}>
          <AvatarImage src={
            post.shared_post_id
              ? post.original_user_avatar || undefined
              : (post.user_id === authUser?.id ? authUser?.profile?.avatar_url : post.user_avatar) || undefined
          } />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {(post.shared_post_id ? post.original_user_name : post.user_name)?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}>{post.user_name}</span>
            <Badge variant={post.post_type === "find" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 shrink-0 rounded-full">
              {post.post_type === "find" ? (<><Search className="w-3 h-3 mr-0.5" /> {t('find')}</>) : (<><Wrench className="w-3 h-3 mr-0.5" /> {t('provide')}</>)}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
        </div>
        {authUser?.id === post.user_id ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/edit-post?id=${post.id}`)}>
                <Edit3 className="w-4 h-4 mr-2" /> {t('editPostMenu')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> {t('deletePost')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled><MoreHorizontal className="w-5 h-5" /></Button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            <span className="font-semibold mr-1 cursor-pointer hover:underline"
              onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}>{post.user_name}</span>
            {displayContent}
          </p>
          {contentTruncated && (
            <button onClick={() => setExpanded(true)} className="text-muted-foreground text-sm hover:text-foreground">{t('more')}</button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media_type === "video" && post.video_url && (
        <div className="w-full bg-black relative">
          <video src={post.video_url} controls className="w-full max-h-[80vh] object-contain mx-auto" preload="metadata" playsInline />
        </div>
      )}

      {post.media_type === "image" && images.length === 1 && (
        <div className="aspect-square bg-muted"><img src={images[0]} className="w-full h-full object-cover" alt="Post" /></div>
      )}

      {isCarousel && (
        <div className="relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {images.map((url, i) => (
                <div key={i} className="w-full flex-shrink-0 aspect-square bg-muted"><img src={url} className="w-full h-full object-cover" alt={`Slide ${i + 1}`} /></div>
              ))}
            </div>
          </div>
          {currentSlide > 0 && (
            <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
          )}
          {currentSlide < images.length - 1 && (
            <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-sm"><ChevronRight className="w-4 h-4" /></button>
          )}
          <div className="absolute top-3 right-3 bg-foreground/60 text-background text-xs px-2 py-0.5 rounded-full">{currentSlide + 1}/{images.length}</div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentSlide ? "bg-primary" : "bg-background/50"}`} />))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLike}>
              <Heart className={`w-6 h-6 transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleToggleComments}>
              <MessageCircle className="w-6 h-6 text-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowShareDialog(true)}>
              <Share2 className="w-6 h-6 text-foreground" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-primary text-xs font-semibold gap-1" onClick={handleContact}>
            <Send className="w-4 h-4" /> {t('contact')}
          </Button>
        </div>

        {likeCount > 0 && (
          <p className="text-sm font-semibold mt-1">{likeCount} {likeCount === 1 ? t('like') : t('likes')}</p>
        )}

        {commentCount > 0 && !showComments && (
          <button onClick={handleToggleComments} className="text-muted-foreground text-sm mt-0.5">
            {t('viewAllComments', { count: commentCount })}
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-3 space-y-2">
          {comments.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {comments.map((c) => (
                <p key={c.id} className="text-sm"><span className="font-semibold mr-1">{c.user_name}</span>{c.content}</p>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder={t('addComment')}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground py-2" />
            <button onClick={handleAddComment} disabled={!commentText.trim()} className="text-primary text-sm font-semibold disabled:opacity-40">{t('post')}</button>
          </div>
        </div>
      )}

      <SharePostDialog post={post} open={showShareDialog} onOpenChange={setShowShareDialog} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deletePostTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deletePostDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
