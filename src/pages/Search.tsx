import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, MapPin, Filter } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCategoryFilter } from "@/components/Feed/ServiceCategoryFilter";
import { RatingDisplay } from "@/components/ui/rating-display";
import { supabase } from "@/integrations/supabase/client";

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    fetchProfiles();
  }, [searchParams]);

  const fetchProfiles = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .not('name', 'is', null) // Only fetch profiles that have a name
        .order('name');

      if (error) throw error;
      setProfiles(profileData || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchQuery === "" || 
      profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.service_types?.some((service: string) => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === null || 
      profile.service_types?.some((service: string) => 
        service.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    
    return matchesSearch && matchesCategory;
  });

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile?user=${profileId}`);
  };

  return (
    <Layout title="Search Profiles">
      <div className="container-mobile space-y-4 py-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search profiles, services, or location..."
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
              {filteredProfiles.length} profiles found
            </h2>
            <Button variant="ghost" size="sm" className="text-primary text-xs sm:text-sm">
              Sort by rating
            </Button>
          </div>

          {/* Provider Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <div key={profile.id} className="post-card p-4 space-y-3">
                  {/* Profile Header */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar 
                        className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => handleProfileClick(profile.user_id)}
                      >
                        <AvatarImage src={profile.avatar_url} alt={profile.name || 'User'} />
                        <AvatarFallback>{profile.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      {profile.is_provider && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                          <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleProfileClick(profile.user_id)}
                        >
                          {profile.name || 'User'}
                        </h3>
                        {profile.is_provider && (
                          <Badge variant="secondary" className="text-xs">
                            Provider
                          </Badge>
                        )}
                      </div>

                      {profile.service_types && profile.service_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {profile.service_types.map((service: string) => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {profile.location && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{profile.location}</span>
                          </div>
                        </div>
                      )}

                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mb-2">{profile.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => navigate("/messages")}
                    >
                      Contact
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => handleProfileClick(profile.user_id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No profiles found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}