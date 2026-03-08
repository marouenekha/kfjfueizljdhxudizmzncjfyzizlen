import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface LocationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { 
    address: string; 
    latitude: number; 
    longitude: number; 
  }) => void;
  initialLocation?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState(initialLocation || '');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address (simplified - in production use proper geocoding service)
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setSelectedLocation({
            address,
            latitude,
            longitude,
          });
          setSearchQuery(address);
          
          toast({
            title: "Location found",
            description: "Current location retrieved successfully",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Could not get your current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Simplified location search - in production, use proper geocoding service
    // For now, simulate a search result
    const mockLocation = {
      address: searchQuery,
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    };
    
    setSelectedLocation(mockLocation);
    
    toast({
      title: "Location found",
      description: `Found location for "${searchQuery}"`,
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, street, or area..."
                className="pl-9"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>

          {/* Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>

          {/* Map Placeholder */}
          <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Map integration</p>
              <p className="text-xs">Drag to select location</p>
            </div>
          </div>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedLocation.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="flex-1"
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};