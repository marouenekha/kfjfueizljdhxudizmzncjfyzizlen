import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Fix default marker icon issue with Leaflet + bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    return addr?.state || addr?.region || addr?.county || 'Unknown location';
  } catch {
    return 'Unknown location';
  }
};

const searchRegion = async (query: string): Promise<{ name: string; lat: number; lon: number }[]> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&featuretype=state`,
      { headers: { 'Accept-Language': 'en' } }
    );
    let data = await res.json();
    if (data.length === 0) {
      const fallbackRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      data = await fallbackRes.json();
    }
    const seen = new Set<string>();
    return data
      .map((item: any) => {
        const addr = item.address;
        const name = addr?.state || addr?.region || item.display_name.split(',')[0];
        return { name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
      })
      .filter((item: { name: string }) => {
        if (seen.has(item.name)) return false;
        seen.add(item.name);
        return true;
      });
  } catch {
    return [];
  }
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}) => {
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialLocation || '');
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const updateMarkerAndCity = useCallback(async (lat: number, lng: number) => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
    const city = await reverseGeocode(lat, lng);
    setSelectedLocation({ address: city, latitude: lat, longitude: lng });
    setSearchQuery(city);
    setSearchResults([]);
  }, []);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [33.5731, -7.5898], // Default: Casablanca
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([33.5731, -7.5898], {
        icon: defaultIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateMarkerAndCity(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        updateMarkerAndCity(e.latlng.lat, e.latlng.lng);
      });

      // Allow map drag to update city when user stops panning
      map.on('moveend', () => {
        // Only update if user is dragging the map (not programmatic)
      });

      mapRef.current = map;
      markerRef.current = marker;

      // If initial location, try to geocode it
      if (initialLocation) {
        searchRegion(initialLocation).then(results => {
          if (results.length > 0) {
            const { lat, lon } = results[0];
            map.setView([lat, lon], 10);
            marker.setLatLng([lat, lon]);
            setSelectedLocation({ address: results[0].name, latitude: lat, longitude: lon });
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open]);

  const getCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateMarkerAndCity(latitude, longitude);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 12);
        }
        setLoadingGps(false);
        toast({ title: "Location found", description: "Current location retrieved successfully" });
      },
      () => {
        setLoadingGps(false);
        toast({ title: "Location error", description: "Could not get your current location", variant: "destructive" });
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    const results = await searchRegion(searchQuery);
    setSearchResults(results);
    setLoadingSearch(false);
    if (results.length === 0) {
      toast({ title: "No results", description: "No cities found for your search", variant: "destructive" });
    }
  };

  const selectSearchResult = (result: { name: string; lat: number; lon: number }) => {
    setSelectedLocation({ address: result.name, latitude: result.lat, longitude: result.lon });
    setSearchQuery(result.name);
    setSearchResults([]);
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([result.lat, result.lon], 12);
      markerRef.current.setLatLng([result.lat, result.lon]);
    }
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
          <DialogTitle>Select Region</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a region..."
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline" disabled={loadingSearch}>
              {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg overflow-hidden divide-y divide-border">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(result)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  {result.name}
                </button>
              ))}
            </div>
          )}

          {/* GPS Button */}
          <Button onClick={getCurrentLocation} variant="outline" className="w-full" disabled={loadingGps}>
            {loadingGps ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
            Use Current Location
          </Button>

          {/* Interactive Map */}
          <div
            ref={mapContainerRef}
            className="h-56 rounded-lg overflow-hidden border border-border"
            style={{ zIndex: 0 }}
          />
          <p className="text-xs text-muted-foreground text-center">
            Tap on the map or drag the pin to select a city
          </p>

          {/* Selected City */}
          {selectedLocation && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <p className="font-medium text-sm">{selectedLocation.address}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedLocation} className="flex-1">
              Confirm City
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
