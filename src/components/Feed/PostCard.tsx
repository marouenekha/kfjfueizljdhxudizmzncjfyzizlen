import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="post-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar
          className="w-10 h-10 cursor-pointer"
          onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}
        >
          <AvatarImage src={post.user_avatar || undefined} />
          <AvatarFallback>{post.user_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-sm truncate cursor-pointer hover:underline"
              onClick={() => post.user_id && navigate(`/profile?user=${post.user_id}`)}
            >
              {post.user_name}
            </span>
            <Badge
              variant={post.post_type === "find" ? "default" : "secondary"}
              className="text-[10px] px-2 py-0 shrink-0"
            >
              {post.post_type === "find" ? (
                <><Search className="w-3 h-3 mr-1" /> Find</>
              ) : (
                <><Wrench className="w-3 h-3 mr-1" /> Provide</>
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

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
        <div className="relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
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
          {/* Nav arrows */}
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {currentSlide < images.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentSlide ? "bg-primary" : "bg-background/60"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {post.content && (
        <div className="px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      )}
    </div>
  );
}
