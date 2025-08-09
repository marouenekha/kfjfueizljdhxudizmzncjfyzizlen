import { useState, useEffect } from "react";
import { Edit, Settings, Share, Star, MapPin, Calendar, Award, Users, MessageCircle, UserPlus, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/Feed/PostCard";
import { RatingDisplay } from "@/components/ui/rating-display";
import { useAuth } from "@/contexts/AuthContext";

// Mock user data
const mockUser = {
  id: "1",
  name: "Ahmed Al-Rashid",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop",
  bio: "Professional plumber with 8+ years of experience in Dubai. Specializing in modern installations and emergency repairs. Quick response guaranteed! 🔧",
  location: "Dubai Marina, UAE",
  joinedDate: "2020-03-15",
  isProvider: true,
  serviceTypes: ["Plumbing", "Electrical", "Maintenance"],
  rating: 4.8,
  reviewCount: 127,
  completedJobs: 342,
  followers: 1234,
  following: 89,
  priceRange: "AED 100-300 per hour",
  responseTime: "Usually responds within 2 hours",
  isOnline: true
};

// Mock Sarah Johnson data
const mockSarahUser = {
  id: "2",
  name: "Sarah Johnson",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e2c8a6?w=150&h=150&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=300&fit=crop",
  bio: "Interior designer with a passion for creating beautiful, functional spaces. Specializing in modern and minimalist designs. ✨",
  location: "Business Bay, Dubai",
  joinedDate: "2021-06-20",
  isProvider: true,
  serviceTypes: ["Interior Design", "Consultation", "Home Styling"],
  rating: 4.9,
  reviewCount: 89,
  completedJobs: 156,
  followers: 567,
  following: 234,
  priceRange: "AED 200-500 per hour",
  responseTime: "Usually responds within 1 hour",
  isOnline: false
};

// Mock posts
const mockPosts = [
  {
    id: "1",
    user: {
      ...mockUser,
      rating: mockUser.rating,
      totalReviews: mockUser.reviewCount
    },
    content: "Just finished installing a modern kitchen sink for a lovely family in Dubai Marina! 🔧✨",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"
    ],
    serviceCategory: "home",
    location: "Dubai Marina, Dubai",
    likes: 24,
    comments: 8,
    createdAt: "2024-01-15T10:30:00Z",
    isLiked: false
  }
];

const mockReviews = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e2c8a6?w=50&h=50&fit=crop&crop=face"
    },
    rating: 5,
    comment: "Ahmed was fantastic! Quick, professional, and solved our plumbing issue perfectly. Highly recommend!",
    date: "2024-01-10",
    projectType: "Kitchen Installation"
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
    },
    rating: 5,
    comment: "Excellent service and very reasonable pricing. Ahmed explained everything clearly.",
    date: "2024-01-05",
    projectType: "Bathroom Repair"
  }
];

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const viewingOtherUser = searchParams.get('user');
  const isOwnProfile = !viewingOtherUser || viewingOtherUser === 'me';
  
  // Select the appropriate user data - for now using mock data for other users
  const user = viewingOtherUser === 'sarah' ? mockSarahUser : (authUser?.profile ? {
    id: authUser.id,
    name: authUser.profile.name || "User",
    avatar: authUser.profile.avatar_url,
    bio: authUser.profile.bio || "Welcome to my profile!",
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
  } : mockUser);
  const posts = mockPosts;
  const reviews = mockReviews;

  const handleUserClick = (userName: string) => {
    if (userName === "Sarah Johnson") {
      navigate("/profile?user=sarah");
    }
  };

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
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
          
          <TabsContent value="portfolio" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-155690911${item}?w=200&h=200&fit=crop`}
                    alt={`Portfolio ${item}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="post-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => handleUserClick(review.user.name)}
                  >
                    <AvatarImage src={review.user.avatar} alt={review.user.name} />
                    <AvatarFallback>{review.user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleUserClick(review.user.name)}
                      >
                        {review.user.name}
                      </span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {review.projectType} • {review.date}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}