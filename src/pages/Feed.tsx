import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { PostCard } from "@/components/Feed/PostCard";
import { ServiceCategoryFilter } from "@/components/Feed/ServiceCategoryFilter";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data for development
const mockPosts = [
  {
    id: "1",
    user: {
      id: "1",
      name: "Ahmed Al-Rashid",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isProvider: true,
      serviceTypes: ["plumbing", "electrical"]
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
  },
  {
    id: "2",
    user: {
      id: "2",
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e2c8a6?w=150&h=150&fit=crop&crop=face",
      isProvider: true,
      serviceTypes: ["graphic-design", "web-design"]
    },
    content: "New logo design for a tech startup! Clean, modern, and memorable. What do you think? 🎨",
    images: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop"
    ],
    serviceCategory: "digital",
    location: "Business Bay, Dubai",
    likes: 45,
    comments: 12,
    createdAt: "2024-01-15T08:15:00Z",
    isLiked: true
  },
  {
    id: "3",
    user: {
      id: "3",
      name: "Marie Dubois",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isProvider: true,
      serviceTypes: ["event-planning", "wedding-planning"]
    },
    content: "Successfully organized an amazing corporate event for 200+ guests! Every detail was perfect 💼🎉",
    images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1515169067868-5387ec050dac?w=400&h=300&fit=crop"
    ],
    serviceCategory: "events",
    location: "DIFC, Dubai",
    likes: 67,
    comments: 23,
    createdAt: "2024-01-14T16:45:00Z",
    isLiked: false
  }
];

export default function Feed() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts] = useState(mockPosts);
  const navigate = useNavigate();

  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.serviceCategory === selectedCategory)
    : posts;

  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="container-mobile space-y-4 py-4">
        {/* Demo Auth Button */}
        <div className="bg-card rounded-lg p-4 border">
          <p className="text-sm text-muted-foreground mb-2">Voir la page d'authentification :</p>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline" 
            className="w-full"
          >
            🔐 Page d'Authentification
          </Button>
        </div>

        {/* Service Category Filter */}
        <ServiceCategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center py-8">
          <button className="px-6 py-2 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors">
            Load More Posts
          </button>
        </div>
      </div>
    </Layout>
  );
}