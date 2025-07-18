import { useState } from "react";
import { Heart, MessageCircle, Share, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/ui/rating-display";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isProvider: boolean;
    serviceTypes: string[];
    rating?: number;
    totalReviews?: number;
  };
  content: string;
  images: string[];
  serviceCategory: string;
  location: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
}

const serviceCategories = {
  home: { label: "Home Services", color: "service-badge-home" },
  digital: { label: "Digital Services", color: "service-badge-digital" },
  events: { label: "Events", color: "service-badge-events" },
  wellness: { label: "Wellness", color: "service-badge-wellness" },
  business: { label: "Business", color: "service-badge-business" }
};

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const category = serviceCategories[post.serviceCategory as keyof typeof serviceCategories];

  return (
    <div className="post-card p-4 space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{post.user.name}</h3>
              {post.user.isProvider && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  Provider
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{post.location}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
              {post.user.rating && post.user.totalReviews && (
                <RatingDisplay 
                  rating={post.user.rating} 
                  reviews={post.user.totalReviews} 
                  size="sm" 
                />
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Service Category */}
      {category && (
        <Badge className={cn("service-badge", category.color)}>
          {category.label}
        </Badge>
      )}

      {/* Content */}
      <p className="text-sm leading-relaxed">{post.content}</p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative">
          <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
            <img
              src={post.images[currentImageIndex]}
              alt="Post content"
              className="w-full h-full object-cover"
            />
            {post.images.length > 1 && (
              <>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{post.images.length}
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              isLiked ? "text-red-500 bg-red-50 hover:bg-red-100" : "hover:bg-muted"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-sm font-medium">{likes}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2 rounded-lg">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{post.comments}</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="px-3 py-2 rounded-lg">
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};