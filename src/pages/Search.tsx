import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, MapPin, Filter } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCategoryFilter } from "@/components/Feed/ServiceCategoryFilter";
import { RatingDisplay } from "@/components/ui/rating-display";

// Mock provider data
const mockProviders = [
  {
    id: "1",
    name: "Ahmed Al-Rashid",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 127,
    serviceTypes: ["Plumbing", "Electrical"],
    location: "Dubai Marina",
    distance: "2.1 km",
    bio: "Professional plumber with 8+ years experience. Quick response, quality work.",
    priceRange: "AED 100-300",
    isOnline: true,
    portfolioImages: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop",
      "https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=200&h=150&fit=crop"
    ]
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e2c8a6?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 89,
    serviceTypes: ["Graphic Design", "Branding"],
    location: "Business Bay",
    distance: "1.8 km",
    bio: "Creative designer specializing in modern branding and digital assets.",
    priceRange: "AED 200-800",
    isOnline: true,
    portfolioImages: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop",
      "https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?w=200&h=150&fit=crop"
    ]
  },
  {
    id: "3",
    name: "Marie Dubois",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5.0,
    reviewCount: 156,
    serviceTypes: ["Event Planning", "Wedding Coordinator"],
    location: "DIFC",
    distance: "3.2 km",
    bio: "Luxury event planner with attention to every detail. Making dreams come true.",
    priceRange: "AED 500-2000",
    isOnline: false,
    portfolioImages: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=150&fit=crop",
      "https://images.unsplash.com/photo-1515169067868-5387ec050dac?w=200&h=150&fit=crop"
    ]
  }
];

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);
  const [providers] = useState(mockProviders);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = searchQuery === "" || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.serviceTypes.some(service => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === null || 
      provider.serviceTypes.some(service => 
        service.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout title="Search Providers">
      <div className="container-mobile space-y-4 py-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search services or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-xl border-border focus:border-primary"
          />
        </div>

        {/* Location & Filter */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">Near Dubai Marina</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <ServiceCategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold">
              {filteredProviders.length} providers found
            </h2>
            <Button variant="ghost" size="sm" className="text-primary text-xs sm:text-sm">
              Sort by rating
            </Button>
          </div>

          {/* Provider Cards */}
          <div className="space-y-4">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="post-card p-4 space-y-3">
                {/* Provider Header */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={provider.avatar} alt={provider.name} />
                      <AvatarFallback>{provider.name[0]}</AvatarFallback>
                    </Avatar>
                    {provider.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{provider.name}</h3>
                      <RatingDisplay 
                        rating={provider.rating} 
                        reviews={provider.reviewCount} 
                        size="sm"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.serviceTypes.map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{provider.location} • {provider.distance}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{provider.bio}</p>
                    <p className="text-sm font-medium text-primary">{provider.priceRange}</p>
                  </div>
                </div>

                {/* Portfolio Preview */}
                <div className="flex gap-2 overflow-x-auto">
                  {provider.portfolioImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs sm:text-sm">
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}