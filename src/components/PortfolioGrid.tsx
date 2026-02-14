import { useState, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
}

interface PortfolioGridProps {
  userId: string;
  isOwnProfile: boolean;
  userName: string;
  userAvatar?: string;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ 
  userId, 
  isOwnProfile, 
  userName, 
  userAvatar 
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchPortfolioItems();
  }, [userId]);

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? items.length - 1 : selectedIndex - 1);
      setShowFullDescription(false);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === items.length - 1 ? 0 : selectedIndex + 1);
      setShowFullDescription(false);
    }
  };

  const truncateDescription = (text?: string, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No portfolio items</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isOwnProfile 
            ? "Showcase your work by adding images and videos to your portfolio!"
            : "This user hasn't added any portfolio items yet."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Instagram-style grid */}
      <div className="grid grid-cols-3 gap-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedIndex(index)}
            className="aspect-square relative group overflow-hidden rounded"
          >
            {item.video_url ? (
              <div className="relative w-full h-full">
                <video
                  src={item.video_url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Full-screen view dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
          {selectedItem && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback>{userName[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{userName}</span>
                <Button
                  onClick={() => setSelectedIndex(null)}
                  size="icon"
                  variant="ghost"
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Media content */}
              <div className="flex-1 relative flex items-center justify-center bg-black">
                {selectedItem.video_url ? (
                  <video
                    src={selectedItem.video_url}
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                ) : selectedItem.image_url ? (
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}

                {/* Navigation arrows */}
                {items.length > 1 && (
                  <>
                    <Button
                      onClick={goToPrevious}
                      size="icon"
                      variant="outline"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={goToNext}
                      size="icon"
                      variant="outline"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="p-4 border-t">
                <h3 className="font-semibold mb-2">{selectedItem.title}</h3>
                {selectedItem.description && (
                  <div className="text-sm text-muted-foreground">
                    <p className={showFullDescription ? '' : 'line-clamp-2'}>
                      {showFullDescription 
                        ? selectedItem.description
                        : truncateDescription(selectedItem.description)
                      }
                    </p>
                    {selectedItem.description.length > 80 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-primary hover:underline mt-1"
                      >
                        {showFullDescription ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};