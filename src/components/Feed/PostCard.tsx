import { useState } from "react";
import { Heart, MessageCircle, Share, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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
  cleaning: { label: "Cleaning", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  handyman: { label: "Handyman", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  gardening: { label: "Gardening", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  tutoring: { label: "Tutoring", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  delivery: { label: "Delivery", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  pet_care: { label: "Pet Care", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  beauty: { label: "Beauty & Wellness", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  tech: { label: "Tech Support", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  fitness: { label: "Fitness", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  business: { label: "Business", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" }
};

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate(`/profile?user=${post.user_id}`);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const nextImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images!.length);
    }
  };

  const prevImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + post.images!.length) % post.images!.length);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar 
            className="w-10 h-10 cursor-pointer" 
            onClick={handleUserClick}
          >
            <AvatarImage src={post.profiles.avatar_url} />
            <AvatarFallback>{post.profiles.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-semibold text-sm cursor-pointer hover:underline"
                    onClick={handleUserClick}
                  >
                    {post.profiles.name}
                  </h3>
                  {post.profiles.is_provider && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Provider
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  {post.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{post.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(post.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {post.service_category && (
                <Badge 
                  className={`text-xs px-2 py-1 ${serviceCategories[post.service_category as keyof typeof serviceCategories]?.color || 'bg-gray-100 text-gray-800'}`}
                >
                  {serviceCategories[post.service_category as keyof typeof serviceCategories]?.label || post.service_category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{post.title}</h2>
          {post.content && (
            <p className="text-sm leading-relaxed">{post.content}</p>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="relative mt-4 rounded-lg overflow-hidden bg-muted">
            <img
              src={post.images[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              className="w-full h-64 sm:h-80 object-cover"
            />
            
            {post.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 p-0 h-auto"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm">{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 p-0 h-auto"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Comment</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};