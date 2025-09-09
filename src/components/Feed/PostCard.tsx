import { useState } from "react";
import { Heart, MessageCircle, Share, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  service_category?: string;
  location?: string;
  images?: string[];
  created_at: string;
  profiles: {
    name: string;
    avatar_url?: string;
    is_provider: boolean;
  };
}

interface PostCardProps {
  post: Post;
}

const serviceCategories = {
  home: { label: "Home Services", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  digital: { label: "Digital Services", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  events: { label: "Events", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  wellness: { label: "Wellness", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  business: { label: "Business", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" }
};

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleUserClick = () => {
    navigate(`/profile?user=${post.user_id}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const category = serviceCategories[post.service_category as keyof typeof serviceCategories];

  return (
    <div className="bg-card border rounded-lg p-4 md:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar 
            className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            onClick={handleUserClick}
          >
            <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.name} />
            <AvatarFallback>{post.profiles?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 
                className="font-medium text-sm cursor-pointer hover:text-primary transition-colors truncate"
                onClick={handleUserClick}
              >
                {post.profiles?.name || 'Anonymous User'}
              </h3>
              {post.profiles?.is_provider && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  Provider
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {post.location && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{post.location}</span>
                  <span>•</span>
                </>
              )}
              <Calendar className="w-3 h-3" />
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Category */}
      {category && (
        <Badge className={cn("text-xs border-0", category.color)}>
          {category.label}
        </Badge>
      )}

      {/* Content */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">{post.title}</h4>
        {post.content && (
          <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
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
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
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
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium",
              isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            {likes}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-4 h-4" />
            0
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="px-3 py-2 h-auto text-muted-foreground hover:text-foreground"
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};