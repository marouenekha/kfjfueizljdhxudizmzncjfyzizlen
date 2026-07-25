import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, MapPin, Filter } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { openWhatsApp } from "@/lib/whatsapp";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { LocationSelector } from "@/components/ui/location-selector";
import { useTranslation } from "react-i18next";

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  
  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').not('name', 'is', null).order('name');
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) { console.error('Error fetching profiles:', error); }
    finally { setLoading(false); }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchQuery === "" || 
      profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.service_types?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = selectedRegion === "" || profile.location?.toLowerCase().includes(selectedRegion.toLowerCase());
    return matchesSearch && matchesRegion;
  });

  return (
    <Layout title={t('searchProfiles')}>
      <div className="w-full max-w-2xl mx-auto px-4 space-y-4 py-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-xl border-border focus:border-primary" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2 flex-1 min-w-0" onClick={() => setShowLocationSelector(true)}>
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">{selectedRegion || t('selectRegion')}</span>
          </Button>
          {selectedRegion && (
            <Button variant="ghost" size="sm" className="flex-shrink-0 text-xs" onClick={() => setSelectedRegion("")}>{t('clear')}</Button>
          )}
          <Button variant="outline" size="sm" className="flex-shrink-0"><Filter className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold">{t('profilesFound', { count: filteredProfiles.length })}</h2>
            <Button variant="ghost" size="sm" className="text-primary text-xs sm:text-sm">{t('sortByRating')}</Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <div key={profile.id} className="post-card p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => navigate(`/profile?user=${profile.user_id}`)}>
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
                        <h3 className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/profile?user=${profile.user_id}`)}>{profile.name || 'User'}</h3>
                        {profile.is_provider && <Badge variant="secondary" className="text-xs">{t('provider')}</Badge>}
                      </div>
                      {profile.service_types && profile.service_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {profile.service_types.map((s: string) => (<Badge key={s} variant="secondary" className="text-xs">{s}</Badge>))}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>{profile.location}</span></div>
                        </div>
                      )}
                      {profile.bio && <p className="text-sm text-muted-foreground mb-2">{profile.bio}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs sm:text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white" onClick={() => { if (!user) { navigate('/auth'); return; } openWhatsApp(profile.phone, `Hi ${profile.name || ''}!`); }}>
                      <WhatsAppIcon size={16} className="mr-2" /> {t('whatsapp')}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm" onClick={() => navigate(`/profile?user=${profile.user_id}`)}>
                      {t('viewProfile')}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noProfilesFound')}</p>
                <p className="text-sm text-muted-foreground mt-2">{t('tryAdjusting')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <LocationSelector open={showLocationSelector} onOpenChange={setShowLocationSelector}
        onLocationSelect={(loc) => { setSelectedRegion(loc.address); }} initialLocation={selectedRegion} />
    </Layout>
  );
}
