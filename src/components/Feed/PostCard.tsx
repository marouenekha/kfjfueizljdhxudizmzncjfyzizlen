import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ name: string; text: string }[]>([]);
  const [expanded, setExpanded] = useState(false);

  const images = post.images || [];
  const isCarousel = post.media_type === "carousel" && images.length > 1;
  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : "";

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % images.length);
  const prevSlide = () => setCurrentSlide((p) => (p === 0 ? images.length - 1 : p - 1));

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < images.length - 1) nextSlide();
      if (diff < 0 && currentSlide > 0) prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [...prev, { name: "You", text: commentText.trim() }]);
    setCommentText("");
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ text: post.content || "", url: window.location.href });
    } catch {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleContact = () => {
    if (post.user_id) navigate(`/messages?user=${post.user_id}`);
  };

  const contentTruncated = post.content && post.content.length > 120 && !expanded;
  const displayContent = contentTruncated
    ? post.content!.slice(0, 120) + "..."
    : post.content;

  return (
    <div className="bg-card border-b border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar
          className="w-10 h-10 cursor-pointer ring-2 ring-primary/20"
          onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}
        >
          <AvatarImage src={post.user_avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {post.user_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}
            >
              {post.user_name}
            </span>
            <Badge
              variant={post.post_type === "find" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 shrink-0 rounded-full"
            >
              {post.post_type === "find" ? (
                <><Search className="w-3 h-3 mr-0.5" /> Find</>
              ) : (
                <><Wrench className="w-3 h-3 mr-0.5" /> Provide</>
              )}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Content above media */}
      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            <span
              className="font-semibold mr-1 cursor-pointer hover:underline"
              onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}
            >
              {post.user_name}
            </span>
            {displayContent}
          </p>
          {contentTruncated && (
            <button
              onClick={() => setExpanded(true)}
              className="text-muted-foreground text-sm hover:text-foreground"
            >
              more
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media_type === "video" && post.video_url && (
        <div className="aspect-[9/16] max-h-[500px] bg-muted">
          <video
            src={post.video_url}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          />
        </div>
      )}

      {post.media_type === "image" && images.length === 1 && (
        <div className="aspect-square bg-muted">
          <img src={images[0]} className="w-full h-full object-cover" alt="Post" />
        </div>
      )}

      {isCarousel && (
        <div
          className="relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {images.map((url, i) => (
                <div key={i} className="w-full flex-shrink-0 aspect-square bg-muted">
                  <img src={url} className="w-full h-full object-cover" alt={`Slide ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {currentSlide < images.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {/* Slide indicator */}
          <div className="absolute top-3 right-3 bg-foreground/60 text-background text-xs px-2 py-0.5 rounded-full">
            {currentSlide + 1}/{images.length}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentSlide ? "bg-primary" : "bg-background/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleLike}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  liked ? "fill-destructive text-destructive" : "text-foreground"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowComments((p) => !p)}
            >
              <MessageCircle className="w-6 h-6 text-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleShare}>
              <Share2 className="w-6 h-6 text-foreground" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs font-semibold gap-1"
            onClick={handleContact}
          >
            <Send className="w-4 h-4" /> Contact
          </Button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <p className="text-sm font-semibold mt-1">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </p>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-3 space-y-2">
          {comments.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {comments.map((c, i) => (
                <p key={i} className="text-sm">
                  <span className="font-semibold mr-1">{c.name}</span>
                  {c.text}
                </p>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground py-2"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="text-primary text-sm font-semibold disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
